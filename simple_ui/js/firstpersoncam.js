// firstpersoncam.js
/*
Copyright 2008 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// Code for a simple quake-style camera.
//
// Notes: This is a very simple camera and intended to be so. The 
// camera's altitude is always 0, relative to the surface of the
// earth.
//

//----------------------------------------------------------------------------
// Global Variables
//----------------------------------------------------------------------------

turnLeft = false;
turnRight = false;
tiltUp = false;
tiltDown = false;

moveForward = false;
moveBackward = false;
strafeLeft = false;
strafeRight = false;
altitudeUp = false;
altitudeDown = false;

INITIAL_CAMERA_ALTITUDE = 1.7; // Roughly 6 feet tall
cameraAltitude = INITIAL_CAMERA_ALTITUDE;
//----------------------------------------------------------------------------
// Utility Functions
//----------------------------------------------------------------------------

// Keep an angle in [-180,180]
function fixAngle(a) {
  while (a < -180) {
    a += 360;
  }
  while (a > 180) {
    a -= 360;
  }
  return a;
}

//----------------------------------------------------------------------------
// Input Handlers
//----------------------------------------------------------------------------
var KeyCodes = {
  BACKSPACE:     8,
  TAB:           9,
  ENTER:        13,
  SHIFT:        16,
  CTRL:         17,
  ALT:          18,
  PAUSE_BREAK:  19,
  CAPS_LOCK:    20,
  ESCAPE:       27,
  SPACE:        32, 
  PAGE_UP:      33,
  PAGE_DOWN:    34,
  END:          35,
  HOME:         36,
  LEFT_ARROW:   37,
  UP_ARROW:     38,
  RIGHT_ARROW:  39,
  DOWN_ARROW:   40,
  INSERT:       45,
  DELETE:       46,
  DIGIT_0:      48,
  DIGIT_1:      49,
  DIGIT_2:      50,
  DIGIT_3:      51,
  DIGIT_4:      52,
  DIGIT_5:      53,
  DIGIT_6:      54,
  DIGIT_7:      55,
  DIGIT_8:      56,
  DIGIT_9:      57,
  LETTER_A:     65,
  LETTER_B:     66,
  LETTER_C:     67,
  LETTER_D:     68,
  LETTER_E:     69,
  LETTER_F:     70,
  LETTER_G:     71,
  LETTER_H:     72,
  LETTER_I:     73,
  LETTER_J:     74,
  LETTER_K:     75,
  LETTER_L:     76,
  LETTER_M:     77,
  LETTER_N:     78,
  LETTER_O:     79,
  LETTER_P:     80,
  LETTER_Q:     81,
  LETTER_R:     82,
  LETTER_S:     83,
  LETTER_T:     84,
  LETTER_U:     85,
  LETTER_V:     86,
  LETTER_W:     87,
  LETTER_X:     88,
  LETTER_Y:     89,
  LETTER_Z:     90,
  SEMI_COLON:  186,
  EQUAL_SIGN:  187,
  COMMA:       188,
  DASH:        189,
  PERIOD:      190,
  FORWARD_SLASH: 191,
  GRAVE_ACCENT:  192,
  OPEN_BRACKET:  219,
  BACK_SLASH:    220,
  CLOSE_BRACKET: 221,
  SINGLE_QUOTE:  222
};
function keyDown(event) {
  if (!event) {
    event = window.event;
  }
  if (event.keyCode == KeyCodes.UP_ARROW) {  // Altitude Up
    altitudeUp = true;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.DOWN_ARROW) {  // Altitude Down
    altitudeDown = true;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_J) {  // Turn Left.
    turnLeft = true;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_L) {  // Turn Right.
    turnRight = true;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_I) {  // Tilt Up.
    tiltUp = true;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_K) {  // Tilt Down.
    tiltDown = true;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_A) {  // Strafe Left.
    strafeLeft = true;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_D) {  // Strafe Right.
    strafeRight = true;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_W) {  // Move Forward.
    moveForward = true;    
    event.returnValue = false;    
  } else if (event.keyCode == KeyCodes.LETTER_S) {  // Move Backward.
    moveBackward = true;     
  } else {
    return true;
  }
  return false;
}

function keyUp(event) {
  if (!event) {
    event = window.event;
  } 
  if (event.keyCode == KeyCodes.UP_ARROW) {  // Altitude Up
    altitudeUp = false;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.DOWN_ARROW) {  // Altitude Down
    altitudeDown = false;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_J) {  // Left.
    turnLeft = false;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_L) {  // Right.
    turnRight = false;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_I) {  // Up.
    tiltUp = false;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_K) {  // Down.
    tiltDown = false;
    event.returnValue = false;   
  } else if (event.keyCode == KeyCodes.LETTER_A) {  // Strafe Left.
    strafeLeft = false;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_D) {  // Strafe Right.
    strafeRight = false;
    event.returnValue = false;
  } else if (event.keyCode == KeyCodes.LETTER_W) {  // Move Forward.
    moveForward = false;    
    event.returnValue = false;    
  } else if (event.keyCode == KeyCodes.LETTER_S) {  // Move Backward.
    moveBackward = false;       
  }
  return false;
}



//----------------------------------------------------------------------------
// JSObject - FirstPersonCamera
//----------------------------------------------------------------------------

function FirstPersonCam() {
  var me = this;
 
  // The anchor point is where the camera is situated at. We store
  // the current position in lat, lon, altitude and in cartesian 
  // coordinates.
  me.localAnchorLla = [37.79333, -122.40, 0];  // San Francisco
  me.localAnchorCartesian = V3.latLonAltToCartesian(me.localAnchorLla);

  // Heading, tilt angle is relative to local frame
  me.headingAngle = 0;
  me.tiltAngle = 0;

  // Initialize the time
  me.lastMillis = (new Date()).getTime();  
  
  // Used for bounce.
  me.distanceTraveled = 0;              

  // prevent mouse navigation in the plugin
  DS_ge.getOptions().setMouseNavigationEnabled(false);

  // Updates should be called on frameend to help keep objects in sync.
  // GE does not propogate changes caused by KML objects until an
  // end of frame.
  google.earth.addEventListener(DS_ge, "frameend", function() { me.update(); });
}

FirstPersonCam.prototype.updateOrientation = function(dt) {
  var me = this;

  // Based on dt and input press, update turn angle.
  if (turnLeft || turnRight) {  
    var turnSpeed = 60.0; // radians/sec
    if (turnLeft)
      turnSpeed *= -1.0;
    me.headingAngle += turnSpeed * dt * Math.PI / 180.0;
  }
  if (tiltUp || tiltDown) {
    var tiltSpeed = 60.0; // radians/sec
    if (tiltDown)
      tiltSpeed *= -1.0;
    me.tiltAngle = me.tiltAngle + tiltSpeed * dt * Math.PI / 180.0;
    // Clamp
    var tiltMax = 50.0 * Math.PI / 180.0;
    var tiltMin = -90.0 * Math.PI / 180.0;
    if (me.tiltAngle > tiltMax)
      me.tiltAngle = tiltMax;
    if (me.tiltAngle < tiltMin)
      me.tiltAngle = tiltMin;
  } 
}

FirstPersonCam.prototype.updatePosition = function(dt) {
  var me = this;
  
  // Convert local lat/lon to a global matrix. The up vector is 
  // vector = position - center of earth. And the right vector is a vector
  // pointing eastwards and the facing vector is pointing towards north.
  var localToGlobalFrame = M33.makeLocalToGlobalFrame(me.localAnchorLla); 
  
  // Move in heading direction by rotating the facing vector around
  // the up vector, in the angle specified by the heading angle.
  // Strafing is similar, except it's aligned towards the right vec.
  var headingVec = V3.rotate(localToGlobalFrame[1], localToGlobalFrame[2],
                             -me.headingAngle);                             
  var rightVec = V3.rotate(localToGlobalFrame[0], localToGlobalFrame[2],
                             -me.headingAngle);
  // Calculate strafe/forwards                              
  var strafe = 0;                             
  if (strafeLeft || strafeRight) {
    var strafeVelocity = 30;
    if (strafeLeft)
      strafeVelocity *= -1;      
    strafe = strafeVelocity * dt;
  }  
  var forward = 0;                             
  if (moveForward || moveBackward) {
    var forwardVelocity = 100;
    if (moveBackward)
      forwardVelocity *= -1;      
    forward = forwardVelocity * dt;
  }  
  if (altitudeUp) {
    cameraAltitude += 1.0;
  } else if (altitudeDown) {
    cameraAltitude -= 1.0;
  }
  cameraAltitude = Math.max(0, cameraAltitude);
  
  me.distanceTraveled += forward;

  // Add the change in position due to forward velocity and strafe velocity 
  me.localAnchorCartesian = V3.add(me.localAnchorCartesian, 
                                   V3.scale(rightVec, strafe));
  me.localAnchorCartesian = V3.add(me.localAnchorCartesian, 
                                   V3.scale(headingVec, forward));
                                                                        
  // Convert cartesian to Lat Lon Altitude for camera setup later on.
  me.localAnchorLla = V3.cartesianToLatLonAlt(me.localAnchorCartesian);
}

FirstPersonCam.prototype.updateCamera = function() {
  var me = this;
  
  var lla = me.localAnchorLla;
  lla[2] = DS_ge.getGlobe().getGroundAltitude(lla[0], lla[1]); 
  
  // Will put in a bit of a stride if the camera is at or below 1.7 meters
  var bounce = 0;  
  if (cameraAltitude <= INITIAL_CAMERA_ALTITUDE /* 1.7 */) {
    bounce = 1.5 * Math.abs(Math.sin(4 * me.distanceTraveled * Math.PI / 180)); 
  }
    
  // Update camera position. Note that tilt at 0 is facing directly downwards.
  //  We add 90 such that 90 degrees is facing forwards.
  var la = DS_ge.createLookAt('');
  la.set(me.localAnchorLla[0], me.localAnchorLla[1],
         cameraAltitude + bounce,
         DS_ge.ALTITUDE_RELATIVE_TO_SEA_FLOOR,
         fixAngle(me.headingAngle * 180 / Math.PI), /* heading */         
         me.tiltAngle * 180 / Math.PI + 90, /* tilt */         
         0 /* altitude is constant */         
         );  
  DS_ge.getView().setAbstractView(la);         
};

FirstPersonCam.prototype.update = function() {
  var me = this;
  
  DS_ge.getWindow().blur();
  
  // Update delta time (dt in seconds)
  var now = (new Date()).getTime();  
  var dt = (now - me.lastMillis) / 1000.0;
  if (dt > 0.25) {
    dt = 0.25;
  }  
  me.lastMillis = now;    
    
  // Update orientation and then position  of camera based
  // on user input   
  me.updateOrientation(dt);
  me.updatePosition(dt);
           
  // Update camera
  me.updateCamera();
};
