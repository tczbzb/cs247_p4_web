using System;
using System.IO;
using System.Linq;
using Microsoft.Research.Kinect.Audio;
using Microsoft.Speech.AudioFormat;
using Microsoft.Speech.Recognition;

public class SpeechRecognizer
{
	public SpeechRecognizer()
	{
        using (var source = new KinectAudioSource())
            {
                source.FeatureMode = true;
                source.AutomaticGainControl = false; //Important to turn this off for speech recognition
				source.SystemMode = SystemMode.OptibeamArrayOnly; //No AEC for this sample

                RecognizerInfo ri = GetKinectRecognizer();

                if (ri == null)
                {
                    Console.WriteLine("Could not find Kinect speech recognizer. Please refer to the sample requirements.");
                    return;
                }

                Console.WriteLine("Using: {0}", ri.Name);

                using (var sre = new SpeechRecognitionEngine(ri.Id))
                {                
                    var commands = new Choices();
                    commands.Add("Xbox Route");
                    commands.Add("Xbox Next Direction");
                    commands.Add("Xbox Previous Direction");
                    commands.Add("Xbox Spell");
                    commands.Add("Stanford");
                    commands.Add("San Jose");
                    commands.Add("Home");
                    commands.Add("650 Escondido Road");
                    commands.Add("California");
                    commands.Add("San Jose International Airport");
                    var letters = new Choices();
                    letters.Add("A");
                    letters.Add("B");
                    letters.Add("C");
                    letters.Add("D");
                    letters.Add("E");
                    letters.Add("F");
                    letters.Add("G");
                    letters.Add("H");
                    letters.Add("I");
                    letters.Add("J");
                    letters.Add("K");
                    letters.Add("L");
                    letters.Add("M");
                    letters.Add("N");
                    letters.Add("O");
                    letters.Add("P");
                    letters.Add("Q");
                    letters.Add("R");
                    letters.Add("S");
                    letters.Add("T");
                    letters.Add("U");
                    letters.Add("V");
                    letters.Add("X");
                    letters.Add("W");
                    letters.Add("Y");
                    letters.Add("Z");

                    var gb = new GrammarBuilder();
                    //Specify the culture to match the recognizer in case we are running in a different culture.                                 
                    gb.Culture = ri.Culture;
                    gb.Append(commands);
                    var gbletter = new GrammarBuilder();
                    gbletter.Culture = ri.Culture;
                    gbletter.Append(letters);

                    // Create the actual Grammar instance, and then load it into the speech recognizer.
                    var g = new Grammar(gb);
                    var gbl = new Grammar(gbletter);

                    sre.LoadGrammar(g);
                    sre.SpeechRecognized += SreSpeechRecognized;
                    sre.SpeechHypothesized += SreSpeechHypothesized;
                    sre.SpeechRecognitionRejected += SreSpeechRecognitionRejected;

                    using (Stream s = source.Start())
                    {
                        sre.SetInputToAudioStream(s,
                                                  new SpeechAudioFormatInfo(
                                                      EncodingFormat.Pcm, 16000, 16, 1,
                                                      32000, 2, null));

						Console.WriteLine("Recognizing. Say: 'Xbox Route', 'Xbox Next Direction', 'Xbox Previous Direction' or 'Xbox Spell (to spell your point)'. Press ENTER to stop");

                        sre.RecognizeAsync(RecognizeMode.Multiple);
                        Console.ReadLine();
                        Console.WriteLine("Stopping recognizer ...");
                        sre.RecognizeAsyncStop();                       
                    }
                }
            }
        }

        private static RecognizerInfo GetKinectRecognizer()
        {
            Func<RecognizerInfo, bool> matchingFunc = r =>
            {
                string value;
                r.AdditionalInfo.TryGetValue("Kinect", out value);
                return "True".Equals(value, StringComparison.InvariantCultureIgnoreCase) && "en-US".Equals(r.Culture.Name, StringComparison.InvariantCultureIgnoreCase);
            };
            return SpeechRecognitionEngine.InstalledRecognizers().Where(matchingFunc).FirstOrDefault();
        }

        static void SreSpeechRecognitionRejected(object sender, SpeechRecognitionRejectedEventArgs e)
        {
			Console.WriteLine("\nSpeech Rejected");
            if (e.Result != null)
                DumpRecordedAudio(e.Result.Audio);
        }

        static void SreSpeechHypothesized(object sender, SpeechHypothesizedEventArgs e)
        {			
            Console.Write("\rSpeech Hypothesized: \t{0}", e.Result.Text);
        }

        static void SreSpeechRecognized(object sender, SpeechRecognizedEventArgs e)
        {
			//This first release of the Kinect language pack doesn't have a reliable confidence model, so 
			//we don't use e.Result.Confidence here.
            Console.WriteLine("\nSpeech Recognized: \t{0}", e.Result.Text);
            if (e.Result.Text == "Xbox Spell")
            {
                /*var ri = GetKinectRecognizer();
                var sre = new SpeechRecognitionEngine(ri);
                sre.RequestRecognizerUpdate(new UpdateGrammarRequest
                {
                    RequestType = GrammarRequestType.UnloadGrammar,
                    Grammar = _currentGrammar
                });
                sre.RequestRecognizerUpdate(new UpdateGrammarRequest
                {
                    RequestType = GrammarRequestType.LoadGrammar,
                    Grammar = _currentGrammar
                });*/
            }
        }
        
        private static void DumpRecordedAudio(RecognizedAudio audio)
        {
            if (audio == null) return;

            int fileId = 0;
            string filename;
            while (File.Exists((filename = "RetainedAudio_" + fileId + ".wav")))
                fileId++;

            Console.WriteLine("\nWriting file: {0}", filename);
            using (var file = new FileStream(filename, System.IO.FileMode.CreateNew))
                audio.WriteToWaveStream(file);
        }
        /*
        private void RecognizerUpdateReached(object sender, RecognizerUpdateReachedEventArgs e)
        {
            var request = e.UserToken as Grammar;
            if (request == null)
                return;
            
            switch (request.RequestType)
            {
                case GrammarRequestType.LoadGrammar:
                    sre.LoadGrammar(request.Grammar);
                    break;
                case GrammarRequestType.UnloadGrammar:
                    sre.UnloadGrammar(request.Grammar);
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }*/
}
