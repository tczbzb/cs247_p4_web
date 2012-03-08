using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Media;
using System.Windows.Shapes;
using System.Windows.Controls;
using Coding4Fun.Kinect.Wpf;
using Microsoft.Research.Kinect.Nui;

namespace SkeletalTracking
{
    class CustomController1 : SkeletonController
    {
        private MainWindow window;
        public CustomController1(MainWindow win)
            : base(win)
        {
            window = win;
            window.webBrowser1.Navigate("http://www.cmslewis.com/cs247/final_project/");
        }

        public override void processSkeletonFrame(SkeletonData skeleton, Dictionary<int, Target> targets)
        {
            foreach (var target in targets)
            {
                Target cur = target.Value;
                int targetID = cur.id; //ID in range [1..5]

                Joint leftHand = skeleton.Joints[JointID.HandLeft].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);
                Joint rightHand = skeleton.Joints[JointID.HandRight].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);
                Joint hip = skeleton.Joints[JointID.HipCenter].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);
                Joint ShoulderRight = skeleton.Joints[JointID.ShoulderRight].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);
                Joint ShoulderLeft = skeleton.Joints[JointID.ShoulderLeft].ScaleTo(640, 480, window.k_xMaxJointScale, window.k_yMaxJointScale);

                //Calculate how far our left hand is from the target in x and y directions
                double deltaX_left = Math.Abs(leftHand.Position.X - cur.getXPosition());
                double deltaY_left = Math.Abs(leftHand.Position.Y - cur.getYPosition());

                //Calculate how far our right hand is from the target in both x and y directions
                double deltaX_right = Math.Abs(rightHand.Position.X - cur.getXPosition());
                double deltaY_right = Math.Abs(rightHand.Position.Y - cur.getYPosition());

                //Calculate how far our right hand is from the target in both x and y directions
                double deltaX_hip = Math.Abs(hip.Position.X - cur.getXPosition());
                double deltaY_hip = Math.Abs(hip.Position.Y - cur.getYPosition());

                //Calculate z distance between hand and hip(our measure of body position)
                double right_stretch = Math.Abs(rightHand.Position.Z - ShoulderRight.Position.Z);
                double right_pan = rightHand.Position.X - ShoulderRight.Position.X;
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
                System.Console.WriteLine("Stretch: " + right_stretch);
                System.Console.WriteLine("Pan: " + right_displacement);
                if (right_stretch >= 0.5)
                {
                    //trigger move forward
                    window.webBrowser1.InvokeScript("DS_moveForward()");
                    //window.webBrowser1.InvokeScript("DS_nextStep()");
                    //cur.setTargetSelected();
                }
                else if (right_stretch <= 0.2)
                {
                    //trigger move backward
                    window.webBrowser1.InvokeScript("DS_moveBackward()");
                    //window.webBrowser1.InvokeScript("DS_previousStep()");
                    //cur.setTargetSelected();
                }
                else if (right_pan >= 25.0)
                {
                    //trigger pan right
                    window.webBrowser1.InvokeScript("DS_moveRight()");
                    //window.webBrowser1.InvokeScript("DS_turnRight()");
                    //cur.setTargetSelected();
                }
                else if (right_pan <= -25.0)
                {
                    //trigger pan left
                    //cur.setTargetSelected();
                    window.webBrowser1.InvokeScript("DS_moveLeft()");
                    //window.webBrowser1.InvokeScript("DS_turnLeft()");
                }
                else if (right_displacement <= -50)
                {
                    //trigger pan up
                    //cur.setTargetSelected();
                    window.webBrowser1.InvokeScript("DS_turnUp()");
                }
                else if (right_displacement >= 50)
                {
                    //trigger pan down
                    window.webBrowser1.InvokeScript("DS_turnDown()");
                }
                else cur.setTargetUnselected();
            }
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
