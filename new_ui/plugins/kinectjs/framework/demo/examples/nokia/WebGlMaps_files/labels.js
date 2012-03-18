var labels = function() {
    Public = {};

    Public.citiesConfig = [
        {name:"San Francisco", latitude:37.794796, longitude:-122.393532, altitude:0, distance:2000},
        {name:"New York", latitude:40.709759, longitude:-74.010043, altitude:0, distance:2000},
        {name:"Toronto", latitude:43.642675, longitude:-79.386928, altitude:76, distance:2000},
        {name:"Miami", latitude:25.777808, longitude:-80.220087, altitude:0, distance:1000},
        {name:"Boston", latitude:42.3585615436, longitude:-71.054950694, altitude:0, distance:1000},
        {name:"Chicago", latitude:41.8854632322, longitude:-87.6281627174, altitude:182, distance:1500},
        {name:"Stockholm", latitude:59.3265746254, longitude:18.0785252899, altitude:0, distance:1000},
        {name:"Copenhagen", latitude:55.6797411937, longitude:12.5952080389, altitude:0, distance:800},
        {name:"Cape Town", latitude:-33.902966, longitude:18.41116, altitude:0, distance:3000, heading:Math.PI},
        {name:"Barcelona", latitude:41.3762210403, longitude:2.17963655479, altitude:0, distance:1000},
        {name:"Helsinki", latitude:60.1657251734, longitude:24.9571062159, altitude:0, distance:1000},
        {name:"Milano", latitude:45.4697782268, longitude:9.1848023444, altitude:120, distance:800},
        {name:"Prague", latitude:50.085493623, longitude:14.4184147085, altitude:200, distance:800},
        {name:"London", latitude:51.4955751231, longitude:-0.130387803517, altitude:24, distance:500},
        {name:"Los Angeles", latitude:34.0512385097, longitude:-118.255855365, altitude:0, distance:2000},
        {name:"Las Vegas", latitude:36.1038646762, longitude:-115.171705111, altitude:0, distance:2000},
        {name:"Madrid", latitude:40.4145650629, longitude:-3.70869426321, altitude:0, distance:2000},
        {name:"Oslo", latitude:59.9116894117, longitude:10.74126776, altitude:0, distance:800},
        {name:"Wien", latitude:48.2062021177, longitude:16.3636730859, altitude:0, distance:2000},
        {name:"Firenze", latitude:43.7731335948, longitude:11.2541629359, altitude:50, distance:800},
        {name:"Venezia", latitude:45.4333184955, longitude:12.333458456, altitude:0, distance:800},
        {name:"Melbourne", latitude:-37.8228484083, longitude:144.944193295, altitude:0, distance:2000},
        {name:"Sydney", latitude:-33.888925, longitude:151.225562, altitude:0, distance:2000}
    ];

    function scaleFunction(label,distance,cosAngle) {
        var maxdist = label.maxDistance*1.5;
        return distance*Math.sqrt(cosAngle)*(maxdist - distance)/maxdist;
    }
    function alphaFunction(label,distance,cosAngle) {
        var maxdist = label.maxDistance*.85;
        return Math.sqrt(cosAngle)*Math.min(maxdist, (maxdist*1.7 - distance))/maxdist;
    }

    Public.createLabels = function(map3d, scene, user, labelConfig) {

        for (var i=0, l=labelConfig.length; i<l; i++) {
            var label = new map3d.Label(labelConfig[i].name, 1, 0.02);
            label.pivotX = -.1;
            label.pivotY = .8;
            label.dot = true;
            label.dotScale = .7;
            label.dropDownText = "ZOOM";
            label.dropDownAlpha = .7;
            label.dropDownScale = .6;
            label.maxDistance = 35;
            label.scaleFunction = scaleFunction;
            label.alphaFunction = alphaFunction;
            label.config = labelConfig[i];
            label.onmouseclick = function() {
                var config = this.config;
                user.flyTo(config.latitude,config.longitude,config.altitude,.5,
                            config.distance,Math.PI*.25,config.heading);
                return true;
            };
            label.onmouseover = function() {
                this.dropDown = 1;
                $("#map3d").css("cursor", "pointer");
                return false;
            };
            label.onmouseout = function() {
                this.dropDown = 0;
                $("#map3d").css("cursor", "auto");
                return false;
            };
            label.onupdate = function() {
                var lab = this, d = (lab.dropDown - lab.dropDownAnim)*.3;
                if (Math.abs(d) > 1e-3) {
                    lab.dropDownAnim += d;
                    return true; // true = need to redraw window
                }
                return false; // false = don't have to redraw
            };
            scene.addLabel(label, 
                    labelConfig[i].latitude,
                    labelConfig[i].longitude,
                    0);
            labelConfig[i].label = label;
        }
    };

    return Public;
}();
