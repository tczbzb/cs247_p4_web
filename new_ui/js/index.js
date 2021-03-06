// index.js
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

/**
 * @fileoverview This is the main JavaScript file for the Driving Simulator
 * @author Roman Nurik
 * @supported Tested in IE6+ and FF2+
 */

/**
 * The global Directions object for the currently loaded directions
 * @type {google.maps.Directions}
 */
var DS_directions = null;

/**
 * The list of driving steps loaded from google.maps.Directions
 * @type {Array.<Object>}
 */
var DS_steps = [];

/**
 * The list of path vertices and their metadata for the driving directions
 * @type {Array.<Object>}
 */
var DS_path = []; // entire driving path

/**
 * The global simulator instance that conducts the driving simulation
 * @type {DDSimulator}
 */
var DS_simulator; // instance of the DDSimulator class

/**
 * The car marker that appears on the reference map to the right of the main
 * simulation screen
 * @type {google.maps.Marker}
 */
var DS_mapMarker = null; // car marker on the Map

/**
 * Instead of using the plugin's built-in ID system, which doesn't like when
 * IDs are reused, we will use a separate dictionary mapping ID to placemark
 * object
 * @type {Object}
 */
var DS_placemarks = {};

var DS_currentStep = 0;

var $DS_currentStepDist = null;

/**
 * The callback for when the 'Go!' button is pressed. This uses the Maps API's
 * Directions class to get the route and pull out the individual route steps
 * into a path, which is rendered as a polyline.
 */
function DS_goDirections() {
  $('#route-details').empty();
  $('#route-details').html(
      '<span class="loading">Loading directions...</span>');
  
  if (DS_directions)
    DS_directions.clear();

  DS_directions = new google.maps.Directions(DS_map, null);
  
  google.maps.Event.addListener(DS_directions, 'load', function() {
    DS_directionsLoaded();
  });
  
  google.maps.Event.addListener(DS_directions, 'error', function() {
    $('#route-details').empty();
    $('#route-details').html(
        '<span class="error">No directions found.</span>');
  });
  
  DS_directions.load('from: ' + $('#from').val() + ' to: ' + $('#to').val(),
      {getSteps: true, getPolyline: true});
}

/**
 * Initialization after directions are loaded
 */
function DS_directionsLoaded() {
  // Directions data has loaded
  $('#route-details').empty();
  var route = DS_directions.getRoute(0);
  var start = route.getStartGeocode();
  var end = route.getEndGeocode();
  
  // build the path and step arrays from the google.maps.Directions route
  DS_buildPathStepArrays();
  
  DS_geHelpers.clearFeatures();
  DS_placemarks = {};
  
  // create the starting point placemark
  DS_placemarks['start'] = DS_geHelpers.createPointPlacemark(
      new google.maps.LatLng(start.Point.coordinates[1],
                             start.Point.coordinates[0]),
      {/*description: start.address, */standardIcon: 'grn-diamond'});
  
  // create the point placemarks for each step in the driving directions
  for (var i = 0; i < DS_steps.length; i++) {
    var step = DS_steps[i];
    
    var placemark = DS_geHelpers.createPointPlacemark(
        step.loc, {/*description: step.desc, */standardIcon: 'red-circle'});
    
    DS_placemarks['step-' + i] = placemark; 
    
    google.earth.addEventListener(placemark, 'click', function(event) {
      // match up the placemark to its id in the dictionary to find out
      // which step number it is
      var id = '';
      for (k in DS_placemarks)
        if (DS_placemarks[k].equals(event.getTarget()))
          id = k;
      
      var stepNum = parseInt(id.match(/step-(\d+)/)[1]);
      
      DS_flyToStep(stepNum);
    });
  }
  
  // create the ending point placemark
  DS_placemarks['end'] = DS_geHelpers.createPointPlacemark(
      new google.maps.LatLng(end.Point.coordinates[1],
                             end.Point.coordinates[0]),
      {/*description: end.address, */standardIcon: 'grn-diamond'});
  
  // build the route LineString; instead of creating a LineString using
  // pushLatLngAlt, which has some performance issues, we will construct a
  // KML blob and use parseKml() 
  var lineStringKml = '<LineString><coordinates>\n';
  
  for (var i = 0; i < DS_path.length; i++)
    lineStringKml +=
        DS_path[i].loc.lng().toString() + ',' +
        DS_path[i].loc.lat().toString() +
        ',10\n';
  
  lineStringKml += '</coordinates></LineString>';
  
  // create the route placemark from the LineString KML blob
  var routeLineString = DS_ge.parseKml(lineStringKml);
  routeLineString.setTessellate(true);
  
  var routePlacemark = DS_ge.createPlacemark('');
  routePlacemark.setGeometry(routeLineString);
  DS_placemarks['route'] = routePlacemark;
  
  routePlacemark.setStyleSelector(
      DS_geHelpers.createLineStyle({width: 10, color: '88ff0000'}));
  
  DS_ge.getFeatures().appendChild(routePlacemark);

  // build the left directions list
  DS_buildDirectionsList();
  
  // fly to the start of the route
  /*DS_flyToLatLng(new google.maps.LatLng(
                 start.Point.coordinates[1], start.Point.coordinates[0]));*/
  DS_flyToStep(0);
  
  // enable the simulator controls
  $('#simulator-form input').removeAttr('disabled');
  
  // destroy the simulator if exists
  if (DS_simulator) {
    DS_simulator.destroy();
    DS_simulator = null;
  }
  
  GA.Views.showNextView();
}

/**
 * Generates the DS_path and DS_step arrays from the global DS_directions
 * instance
 * 
 * NOTE: only the first route is used
 */
function DS_buildPathStepArrays() {
  // begin processing the directions' steps and path
  DS_steps = [];
  DS_path = [];
  
  var polyline = DS_directions.getPolyline();
  var route = DS_directions.getRoute(0);
  var numPolylineVertices = polyline.getVertexCount();
  var numSteps = route.getNumSteps();
  
  for (var i = 0; i < numSteps; i++) {
    var step = route.getStep(i);
    
    var firstPolylineIndex = step.getPolylineIndex();
    
    var lastPolylineIndex = -1;
    if (i == numSteps - 1)
      lastPolylineIndex = numPolylineVertices - 1;
    else {
      // subtract 2 because the last vertex of a step is duplicated
      // as the first vertex of the next step in google.maps.Directions results
      lastPolylineIndex = route.getStep(i + 1).getPolylineIndex() - 2;
    }
    
    DS_steps.push({
      loc: step.getLatLng(),
      desc: step.getDescriptionHtml(),
      distanceHtml: step.getDistance().html,
      pathIndex: DS_path.length
    });
    
    var stepDistance = step.getDistance().meters;
    for (var j = firstPolylineIndex; j <= lastPolylineIndex; j++) {
      var loc = polyline.getVertex(j);
      var distance = (j == numPolylineVertices - 1) ?
                     0 : DS_geHelpers.distance(loc, polyline.getVertex(j + 1));
      
      DS_path.push({
        loc: loc,
        step: i,
        distance: distance,
        
        // this segment's time duration is proportional to its length in
        // relation to the length of the step
        duration: step.getDuration().seconds * distance / stepDistance
      });
    }
  }
}

/**
 * Generates the HTML elements for the left directions list
 * 
 * NOTE: only the first route is used
 */
function DS_buildDirectionsList() {
  /*var start = DS_directions.getRoute(0).getStartGeocode();
  var end = DS_directions.getRoute(0).getEndGeocode();*/
  
  /*$('#route-details').append($(
      '<div id="dir-start">' + start.address + '</div>'));*/
  
  $('#route-details').append('<ol>');
  for (var i = 0; i < DS_steps.length; i++) {
    var selectedClass = (i == 0) ? ' class="sel"' : '';
    var leftPos = i * 1440;
    var liHTML =
    '<li id="dir-step-' + i + '"' + selectedClass + ' style="left:' + leftPos + 'px">' +
      '<div class="dirStepContent">' +
        '<div class="description">' + DS_steps[i].desc + '</div>';
    if (i == 0) { 
        liHTML += '<div class="distance"><span>for</span> <span class="hidden total">' + parseFloat(DS_steps[i].distanceHtml) + '</span><span class="val">' + parseFloat(DS_steps[i].distanceHtml) + '</span> <span class="unit">' + DS_steps[i].distanceHtml.substring(DS_steps[i].distanceHtml.indexOf('&nbsp;') + 6) + '</span></div>';
    } else {
        liHTML += '<div class="distance"><span>in</span> <span class="hidden total">' + parseFloat(DS_steps[i-1].distanceHtml) + '</span><span class="val">' + parseFloat(DS_steps[i-1].distanceHtml) + '</span> <span class="unit">' + DS_steps[i - 1].distanceHtml.substring(DS_steps[i-1].distanceHtml.indexOf('&nbsp;') + 6) + '</span></div>';
    }
    liHTML += '</div>' + '</li>';
    $('#route-details ol').append($(liHTML));
  }

  $('#route-details li').click(function() {
    var id = $(this).attr('id');
    var stepNum = parseInt(id.match(/dir-step-(\d+)/)[1]);
    DS_flyToStep(stepNum);
  });
}

/**
 * Fly the camera to the given step index in the route, and highlight it in
 * the directions list. Also show the placemark description balloon.
 * @param {number} stepNum The 0-based step index to fly to
 */
function DS_flyToStep(stepNum) {
  // Enforce stepNum bounds.
  stepNum = Math.max(0, stepNum);
  stepNum = Math.min(DS_steps.length - 1, stepNum);
  
  var step = DS_steps[stepNum];
  
  var la = DS_ge.createLookAt('');
  la.set(step.loc.lat(), step.loc.lng(),
      20, // altitude
      DS_ge.ALTITUDE_RELATIVE_TO_GROUND,
      DS_geHelpers.getHeading(step.loc, DS_path[step.pathIndex + 1].loc),
      70, // tilt
      100 // range (inverse of zoom)
  );
  DS_ge.getView().setAbstractView(la);
  
  DS_highlightStep(stepNum);

  DS_currentStep = stepNum;
}

/**
 * Highlights the given step in the left directions list
 * @param {number} stepNum The 0-based step index to highlight in the
 *     directions list
 */
function DS_highlightStep(stepNum) {
  // Return if we don't need to animate.
  if (stepNum == DS_currentStep) {
    return;
  }
  
  // Determine how far to shift the list (negative => shift right, positive => shift left)
  var new_x = -1440 * (stepNum)
  
  // Move the current step to the right, out of view.
  $('#route-details').animate({
    left: new_x
  }, 250, function() {
    // Animation complete.
  });
}

/**
 * Move the camera to the given location, staring straight down, and unhighlight
 * all items in the left directions list
 * @param {google.maps.LatLng} loc The location to fly the camera to
 */
function DS_flyToLatLng(lat, lng) {
  // var la = DS_ge.createLookAt('');
  //   la.set(loc.lat(), loc.lng(),
  //       10, // altitude
  //       DS_ge.ALTITUDE_RELATIVE_TO_GROUND,
  //       90, // heading
  //       0, // tilt
  //       200 // range (inverse of zoom)
  //       );
  //   DS_ge.getView().setAbstractView(la);
  
  //$('#route-details li').removeClass('sel');
  var lookAt = DS_ge.getView().copyAsLookAt(DS_ge.ALTITUDE_RELATIVE_TO_GROUND);
  //var newLookAt = DS_ge.createLookAt('');
  //newLookAt.set(
    // lat,                    /* Latitude */  
    //   lng,                    /* Longitude */ 
    //   curLookAt.getAltitude(),   /* Altitude */  
    //   DS_ge.ALTITUDE_RELATIVE_TO_GROUND,
    //   curLookAt.getHeading(),    /* Heading */
    //   70,                     /* Tilt */
    //   curLookAt.getRange()
    // );
  lookAt.setLatitude(lat);
  lookAt.setLongitude(lng);
  
  DS_ge.getView().setAbstractView(lookAt);
}

/**
 * Formats a time given in seconds to a human readable format
 * @param {number} s Time in seconds
 * @return {string} A string formatted in hh:mm form representing the given
 *     number of seconds
 */
function DS_formatTime(s) {
  var m = Math.floor(s / 60);
  s %= 60;
  var h = Math.floor(m / 60);
  m %= 60;
  s = Math.round(s);
  return ((h < 10) ? ('0' + h) : h) + ':' + ((m < 10) ? ('0' + m) : m);
}

/**
 * Simulator controls
 * @param {string} command The control command to run
 * @param {Function?} opt_cb Optional callback to run when the command
 *     completes its task
 */
var alreadyUrgent = false;
function DS_controlSimulator(command, opt_cb) {
  switch (command) {
    case 'reset':
      if (DS_simulator)
        DS_simulator.destroy();
      
      // create a DDSimulator object for the current DS_path array
      // on the DS_ge Earth instance
      DS_simulator = new DDSimulator(DS_ge, DS_path, {
        // as the simulator runs, reposition the map on the right and the
        // car marker on the map, and update the status box on the bottom
        on_tick: function() {
          DS_map.panTo(DS_simulator.currentLoc);
          DS_mapMarker.setLatLng(DS_simulator.currentLoc);
          
          if (DS_simulator) {
            // Update remaining distance until next turn.
            $value = $('#route-details #dir-step-' + (DS_currentStep + 1) + ' .distance .val');
            var unit = $value.parent().find('.unit').text();
            var total = parseFloat($value.parent().find('.total').text());
            
            if (unit == 'ft') {
              var feetLeft = Math.max(0, Math.round(total - Math.round(DS_simulator.totalDistance / 1609.344 * 5280)));
              if (feetLeft < 200) {
                if (!alreadyUrgent) {
                  $value.closest('.dirStepContent').addClass('urgent');
                  $value.html('COMING UP!');
                  GA.Audio.REPORT_TURN_APPROACHING.play();
                  alreadyUrgent = true;
                }
              } else {
                $value.html(feetLeft);
                alreadyUrgent = false;
              }
            } else if (unit == 'mi') {
              var milesLeft = Math.max(0, roundNumber(total - (Math.round(DS_simulator.totalDistance / 1609.344 * 10) / 10), 1));
              if (milesLeft <= 0.1) {
                if (!alreadyUrgent) {
                  $value.closest('.dirStepContent').addClass('urgent');
                  $value.html('COMING UP!');
                  GA.Audio.REPORT_TURN_APPROACHING.play();
                  alreadyUrgent = true;
                }
              } else {
                $value.html(milesLeft);
                alreadyUrgent = false;
              }
            }
          }
        },
        
        // when the simulator moves to a new step (specified as an integer
        // index in DS_path items), highlight that step in the directions
        // list
        on_changeStep: function(stepNum) {
          DS_simulator.beforeSegmentDistance_ = 0;
          DS_highlightStep(stepNum + 1);
          DS_currentStep = stepNum;
          $DS_currentStepDist = $('#route-details #dir-step-' + (DS_currentStep + 1) + ' .distance .val');
        }
      });
      
      $DS_currentStepDist = $('#route-details #dir-step-' + (DS_currentStep + 1) + ' .distance .val');
      
      if (!DS_mapMarker) {
        // create vehicle location indicator on map
        var icon = new google.maps.Icon();
        icon.iconSize = new google.maps.Size(42, 42);
        icon.iconAnchor = new google.maps.Point(21, 21);
        icon.image = 'images/marker.png';
        DS_mapMarker = new google.maps.Marker(
                       DS_simulator.currentLoc, {icon: icon});
        DS_map.addOverlay(DS_mapMarker);
      }
      
      DS_map.setZoom(17);
      DS_mapMarker.setLatLng(DS_simulator.currentLoc);
      
      DS_updateSpeedIndicator();
      DS_simulator.initUI(opt_cb);
      break;
    
    case 'start':
      if (!DS_simulator)
        DS_controlSimulator('reset', function() {
          DS_simulator.start();
          if (opt_cb) opt_cb();
        });
      else {
        DS_simulator.start();
        if (opt_cb) opt_cb();
      }
      break;
    
    case 'pause':
      if (DS_simulator)
        DS_simulator.stop();
      
      if (opt_cb) opt_cb();
      break;
    
    case 'resume':
      if (DS_simulator)
        DS_simulator.start();
      
      if (opt_cb) opt_cb();
      break;
    
    case 'slower':
      if (DS_simulator && DS_simulator.options.speed > 0.125) {
        DS_simulator.options.speed /= 2.0;
        DS_updateSpeedIndicator();
      }
      break;
    
    case 'faster':
      if (DS_simulator && DS_simulator.options.speed < 32.0) {
        DS_simulator.options.speed *= 2.0;
        DS_updateSpeedIndicator();
      }
      break;
  }
}

/**
 * Update the speed indicator in the simulation controls box to reflect
 * the current simulation speed multiplier
 */
function DS_updateSpeedIndicator() {
  if (DS_simulator.options.speed < 1)
    $('#speed-indicator').text('1/' +
        Math.floor(1 / DS_simulator.options.speed) + 'x');
  else
    $('#speed-indicator').text(Math.floor(DS_simulator.options.speed) + 'x');
}

function DS_nextStep() {
  if (DS_currentStep < DS_steps.length - 1) {
  	DS_flyToStep(DS_currentStep + 1);
  }
}

function DS_previousStep() {
  if (DS_currentStep > 0) {
  	DS_flyToStep(DS_currentStep - 1);
  }
}

var inStreetView = false;
var BUFFER = 20;
var lastRange = -1;

function zoomInSwitch() {
	var lookAt = DS_ge.getView().copyAsLookAt(DS_ge.ALTITUDE_RELATIVE_TO_GROUND);
	if (!inStreetView && lookAt.getRange() < 100) {
		var lat;
		var lng;
		// Stay centered on the current step or current car location.
		if (DS_simulator != null && DS_simulator.totalDistance > 0 && !GA.Earth.isPreviewing) {
			lat = DS_simulator.currentLoc.lat();
			lng = DS_simulator.currentLoc.lng();
		} else {
			lat = DS_steps[DS_currentStep].loc.lat();
			lng = DS_steps[DS_currentStep].loc.lng();
		}

		var step = DS_steps[DS_currentStep];
		lookAt.set(
			lat,
			lng,
			5, // altitude
			DS_ge.ALTITUDE_RELATIVE_TO_GROUND,
			DS_geHelpers.getHeading(step.loc, DS_path[step.pathIndex + 1].loc),
			90, // tilt
			10 // range (inverse of zoom)
		);
		lastRange = 10; // same as above
		DS_ge.getView().setAbstractView(lookAt);
		inStreetView = true;
		return true;
	}
	return false;
}
function DS_zoomIn() {
	// Do not zoom in in street view
	if (inStreetView) {
		return false;
	}
	
	if (!zoomInSwitch()) {
		// Get the current view.
		var lookAt = DS_ge.getView().copyAsLookAt(DS_ge.ALTITUDE_RELATIVE_TO_GROUND);
		var currRange = lookAt.getRange();
	
		if (lastRange == -1) {
			lastRange = currRange;
		}
		if (currRange < 50 || currRange > lastRange + BUFFER) {
			//console.log('range too close!');
			return false; 
		}
	
		// Play a sound.
		GA.Audio.EFFECT_ZOOM_IN.play();
	
		lookAt.setRange(currRange / 2.0);
		lastRange = currRange / 2.0;
	
		// Stay centered on the current step or current car location.  
		if (DS_simulator != null && DS_simulator.totalDistance > 0 && !GA.Earth.isPreviewing) {
			lookAt.setLatitude(DS_simulator.currentLoc.lat());
			lookAt.setLongitude(DS_simulator.currentLoc.lng());
		} else {
			lookAt.setLatitude(DS_steps[DS_currentStep].loc.lat());
			lookAt.setLongitude(DS_steps[DS_currentStep].loc.lng());
		}
  
		// Update the view in Google Earth.
		DS_ge.getView().setAbstractView(lookAt);
	}	
	return true;
}
function DS_zoomOut() {
	// Get the current view.
	var lookAt = DS_ge.getView().copyAsLookAt(DS_ge.ALTITUDE_RELATIVE_TO_GROUND);
	var currRange = inStreetView ? 200 : lookAt.getRange();
	
	if (lastRange == -1) {
	  lastRange = currRange;
	}
	/*if (currRange < lastRange - BUFFER) {
	  return false; 
	}*/
	
	// Play a sound.
	GA.Audio.EFFECT_ZOOM_OUT.play();
	
	if (lookAt.getTilt() > 0) {
		lookAt.setTilt(0);				
	}
	
	// Stay centered on the current step or current car location.
	if (DS_simulator != null && DS_simulator.totalDistance > 0 && !GA.Earth.isPreviewing) {
		lookAt.setLatitude(DS_simulator.currentLoc.lat());
		lookAt.setLongitude(DS_simulator.currentLoc.lng());
	} else {
		lookAt.setLatitude(DS_steps[DS_currentStep].loc.lat());
		lookAt.setLongitude(DS_steps[DS_currentStep].loc.lng());
	}
	
	// Zoom out to twice the current range.
	lookAt.setRange(currRange * 2.0);
	lastRange = currRange * 2.0;
	
	// Update the view in Google Earth.
	DS_ge.getView().setAbstractView(lookAt);
	inStreetView = false;
	
	return true;
}

// Driving Controls
var DS_stepDistanceInMeters = 500;
var DS_stepRotationInDegrees = 15;

function DS_move(direction) {
  // Get the current view.
	var lookAt = DS_ge.getView().copyAsLookAt(DS_ge.ALTITUDE_RELATIVE_TO_GROUND);
  
  // Get the current heading angle in radians, and the location vector [lat, long, alt]
  var headingAngle = lookAt.getHeading() * (Math.PI / 180);
  var localAnchorLla = [lookAt.getLatitude(), lookAt.getLongitude(), lookAt.getAltitude()];
	
	// Convert local lat/lon to a global matrix. The up vector is 
  // vector = position - center of earth. And the right vector is a vector
  // pointing eastwards and the facing vector is pointing towards north.
  var localToGlobalFrame = M33.makeLocalToGlobalFrame(localAnchorLla); 
	
	// Move in heading direction by rotating the facing vector around
  // the up vector, in the angle specified by the heading angle.
  // Strafing is similar, except it's aligned towards the right vec.
  var headingVec = V3.rotate(localToGlobalFrame[1], localToGlobalFrame[2], -headingAngle);                             
  var rightVec = V3.rotate(localToGlobalFrame[0], localToGlobalFrame[2], -headingAngle);
	
	// Calculate strafe/forwards
  var sideways = 0;
  var forward = 0;
  var distanceStep = DS_stepDistanceInMeters + (lookAt.getRange()); // Scale the distance step by the current camera range.
  if (direction == 'right') {
    sideways = distanceStep;
  } else if (direction == 'left') {
    sideways = -1 * distanceStep;
  } else if (direction == 'forward') {
    forward = distanceStep;
  } else if (direction == 'backward') {
    forward = -1 * distanceStep;
  }
  
  // Add the change in position due to forward displacement and strafe displacement. 
  var localAnchorCartesian = V3.latLonAltToCartesian(localAnchorLla);
  localAnchorCartesian = V3.add(localAnchorCartesian, V3.scale(rightVec, sideways));
	localAnchorCartesian = V3.add(localAnchorCartesian, V3.scale(headingVec, forward));
  
  // Convert cartesian to Lat Lon Altitude for camera setup later on.
  localAnchorLla = V3.cartesianToLatLonAlt(localAnchorCartesian);
	
	// Update the user's location on the earth view.
	lookAt.setLatitude(localAnchorLla[0]);
	lookAt.setLongitude(localAnchorLla[1]);
	lookAt.setAltitude(DS_ge.getGlobe().getGroundAltitude(localAnchorLla[0], localAnchorLla[1]));
	DS_ge.getView().setAbstractView(lookAt);
}
function DS_moveUp() {
  DS_move('forward');
}
function DS_moveDown() {
  DS_move('backward');
}
function DS_moveRight() {
  DS_move('right');
}
function DS_moveLeft() {
  DS_move('left');
}

function DS_rotateCamera(direction) {
  // Get the current camera view.
	var camera = DS_ge.getView().copyAsCamera(DS_ge.ALTITUDE_RELATIVE_TO_GROUND);
  
  var tilt = 0;
  var heading = 0;
  if (direction == 'right') {
    heading = DS_stepRotationInDegrees;
  } else if (direction == 'left') {
    heading = -1 * DS_stepRotationInDegrees
  } else if (direction == 'up') {
    tilt = DS_stepRotationInDegrees;
  } else if (direction == 'down') {
    tilt = -1 * DS_stepRotationInDegrees;
  }
  
  // Update tilt and heading.
  camera.setHeading(camera.getHeading() + heading);
  camera.setTilt(Math.min(90, camera.getTilt() + tilt));
  
  // Update the camera view in Google Earth.
  DS_ge.getView().setAbstractView(camera);
}
function DS_turnUp() {
  DS_rotateCamera('up');
}
function DS_turnDown() {
  DS_rotateCamera('down');
}
function DS_turnLeft() {
  DS_rotateCamera('left');
}
function DS_turnRight() {
  DS_rotateCamera('right');
}

function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}
