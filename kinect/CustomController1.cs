using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Windows.Controls;
using Microsoft.Research.Kinect.Nui;
using Coding4Fun.Kinect.Wpf;

namespace SkeletalTracking
{
    class CustomController1 : SkeletonController
    {
        private MainWindow window;
        public CustomController1(MainWindow win)
            : base(win)
        {
            window = win;
            window.webBrowser1.Navigate("http://www.cmslewis.com/cs247/final_project/orig_ui/index.html");
        }

        private ulong count = 0;

        public override void processSkeletonFrame(SkeletonData skeleton, Dictionary<int, Target> targets)
        {
            if (count % 30 == 0) //process 1 frame every second (30f/s)
            {
                Joint leftHand = skeleton.Joints[JointID.HandLeft].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);
                Joint rightHand = skeleton.Joints[JointID.HandRight].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);
                Joint hip = skeleton.Joints[JointID.HipCenter].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);
                Joint ShoulderRight = skeleton.Joints[JointID.ShoulderRight].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);
                Joint ShoulderLeft = skeleton.Joints[JointID.ShoulderLeft].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);
                Joint Head = skeleton.Joints[JointID.Head].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);

                //Calculate how far our left hand is from our left shoulder in the x and y directions.
                double deltaX_left = Math.Abs(leftHand.Position.X - ShoulderLeft.Position.X);
                double deltaY_left = Math.Abs(leftHand.Position.Y - ShoulderLeft.Position.Y);

                //Calculate how far our rigght hand is from our right shoulder in the x and y directions.
                double deltaX_right = Math.Abs(rightHand.Position.X - ShoulderRight.Position.X);
                double deltaY_right = Math.Abs(rightHand.Position.Y - ShoulderRight.Position.Y);
                double deltaZ_right = Math.Abs(rightHand.Position.Z - ShoulderRight.Position.Z);

                //Calculate how far either hand is either above or below the head. (y direction)
                double deltaY_right_HeadDIS = rightHand.Position.Y - Head.Position.Y;
                double deltaY_left_HeadDIS = leftHand.Position.Y - Head.Position.Y;

                //Calculate the how far either hand is from our head in the x direction.
                double deltaX_right_Head = Math.Abs(rightHand.Position.X - Head.Position.X);
                double deltaX_left_Head = Math.Abs(leftHand.Position.X - Head.Position.X);

                //Calculate z distance between hand and hip(our measure of body position)
                double right_stretch = Math.Abs(rightHand.Position.Z - ShoulderRight.Position.Z);
                double left_pan = leftHand.Position.X - ShoulderLeft.Position.X;
                double right_displacement = rightHand.Position.Y - ShoulderRight.Position.Y;
                double left_stretch = Math.Abs(leftHand.Position.Z - hip.Position.Z);



                /*//If we have a hit in a reasonable range, highlight the target
                if (deltaX_left < 100 && deltaY_left < 100)
                {
                    if (left_stretch >= 30)
                    {
                        cur.setTargetSelected();
                        //cur.fireEvent();
                    }
                }*/
                //System.Console.WriteLine("Stretch: " + right_stretch);
                // System.Console.WriteLine("Pan: " + right_displacement);

                //System.Console.WriteLine("deltaXR: " + deltaX_right);
                //System.Console.WriteLine("deltaYR: " + deltaY_right);

                //System.Console.WriteLine("deltaXL: " + deltaX_left);
                //System.Console.WriteLine("deltaYL: " + deltaY_left);
                if (deltaX_right <= 20 && deltaX_right >= 0 && deltaY_right >= 0 && deltaY_right <= 20) //Checks if right hand is in correct position before attempting to see if zoom in works, correct position is right hand in line with right shoulder.
                {
                    System.Console.WriteLine("Your right hand is in line with your right shoulder.");

                    //System.Console.WriteLine("deltaZR: " + deltaZ_right);
                    if (deltaZ_right >= 0.35)
                    {
                        //trigger zoom into map
                        window.webBrowser1.InvokeScript("DS_zoomIn");
                        System.Console.WriteLine("Zoom in gesture recognized.");
                    }
                    else if (deltaZ_right <= 0.1)
                    {
                        //trigger zoom out of map
                        window.webBrowser1.InvokeScript("DS_zoomOut");
                        System.Console.WriteLine("Zoom out gesture recongnized.");
                    }
                }
                else if (left_pan >= 35 && deltaY_left >= 0 && deltaY_left <= 30)
                {
                    //trigger pan right
                    window.webBrowser1.InvokeScript("DS_nextStep");
                    System.Console.WriteLine("Swipe right Gesture recognized.");
                }
                else if (left_pan <= -35 && deltaY_left >= 0 && deltaY_left <= 30)
                {
                    //trigger pan left
                    window.webBrowser1.InvokeScript("DS_previousStep");
                    System.Console.WriteLine("Swipe Left Gesture Recognized.");
                }
                else if ((deltaX_left_Head <= 10 && deltaY_left_HeadDIS < 0) || (deltaX_right_Head <= 10 && deltaY_right_HeadDIS < 0))
                {
                    //Return to current location gesture
                    System.Console.WriteLine("Return to Current Location Gesture Recognized.");
                }
            }
            count++;
        }

        public override void controllerActivated(Dictionary<int, Target> targets)
        {
            int xDelta = 0;
            int initX = 40;
            foreach (var target in targets)
            {
                Target cur = target.Value;
                cur.setTargetPosition(initX + xDelta, 75);
                xDelta += 150;
            }
        }
    }
}
