/**
 * Loads an image to canvas and triggers
 * @param imageurl
 */
var loadImage = function (imageurl) {
    function loadCanvas(imageurl) {
        var canvas = document.getElementById('CamImage');
        var context = canvas.getContext('2d');
        // load image from data url
        var imageObj = new Image();
        imageObj.onload = function () {
            context.drawImage(this, 0, 0, 600, 338);
            getContrastData(canvas);
        };
        imageObj.src = imageurl;
    }

    // make ajax call to get image data url
    var request = new XMLHttpRequest();
    request.open('GET', imageurl, true);
    request.onreadystatechange = function () {
        // Makes sure the document is ready to parse.
        if (request.readyState == 4) {
            // Makes sure it's found the file.
            if (request.status == 200) {
                loadCanvas(imageurl);
            }
        }
    };
    request.send(null);
}


/**
 * The primary function to extract meaningfull classification data out of an image
 * Currently creates 16 rgb-pixels from the loaded image
 * @param canvas
 */
var getContrastData = function (canvas) {
    var block = [[],[],[],[]];
    var cd = {};

    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
            block[y][x] = getAvgColor(canvas, y + 1, x + 1);
        }
    }

    // var greenness = 0;

    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {

            // greenness = (2 * block[y][x].g) - (block[y][x].r + block[y][x].b);

            $('#co'+y+x).css('background-color', 'rgb('+block[y][x].r+','+block[y][x].g+','+block[y][x].b+')');

            var outstring = "";
            outstring += 'R: ' + block[y][x].r + '<br>';
            outstring += 'G: ' + block[y][x].g + '<br>';
            outstring += 'B: ' + block[y][x].b + '<br>';
            $('#co'+y+x).html(outstring);

           //cd[y.toString()+x.toString()] =  normalize(greenness);
            //cd['greenness'] = normalize(greenness);
            // cd[y.toString()+x.toString()] =  normalize(greenness);
            cd[y.toString()+x.toString()+"r"] =  normalize(block[y][x].r);
            cd[y.toString()+x.toString()+"g"] =  normalize(block[y][x].g);
            cd[y.toString()+x.toString()+"b"] =  normalize(block[y][x].b);
        }
    }
    console.log(JSON.stringify(cd));
    $('#imageData').val(JSON.stringify(cd));
}

var normalize = function(val){
    val = Math.round(val / 2.55) / 100;
    return val;
}


/**
 * Returns the average RGB-Values of a given coordinate of the webcam-canvas
 * @param canvas
 * @param y
 * @param x
 * @returns {{r: number, g: number, b: number}}
 */
var getAvgColor = function (canvas, y, x) {

    var raster = 5,
        context = canvas.getContext && canvas.getContext('2d'),
        i = -4,
        rgb = {r: 0, g: 0, b: 0},
        count = 0;

    var sx = x * (canvas.width/4) - (canvas.width/4);
    var sy = y * (canvas.height/4) - (canvas.height/4);
    var sw = canvas.width/4;
    var sh = canvas.height/4;

    var pixeldata = context.getImageData(sx,sy,sw,sh);
    var length = pixeldata.data.length;

    while ((i += raster * 4) < length) {
        ++count;
        rgb.r += pixeldata.data[i];
        rgb.g += pixeldata.data[i + 1];
        rgb.b += pixeldata.data[i + 2];
    }

    rgb.r = ~~(rgb.r / count);
    rgb.g = ~~(rgb.g / count);
    rgb.b = ~~(rgb.b / count);

    return rgb;

}