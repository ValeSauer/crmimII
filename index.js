// Setup depenencides
var express = require('express');
var app = express();
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/views'));
request = require('request');
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
var fs = require('fs'),
brain = require('brain');

var trainingdata = [];              // Stores all trainindata
var history = [];
var successrate = 0;


// Index get
app.get('/', function (req, res) {
    download(getRandomImage(), 'views/images/image.jpg', function () {
        var training = {
            error: '0',
            iterations: '0'
        }
        var output = [
            'no results yet'
        ]
        var yousaid = 'nothing'
        trainingdata = [];
        history = [];
        successrate = 0;
        res.render('train', {training: training, output: output, yousaid: yousaid, history: history, successrate: 0});
    });
});

// Index post
app.post('/', function (req, res) {
    var sight = req.body.sight;
    var imageData = req.body.imageData;

    if (sight == "sunny") {
        myoutput = {sunny: 1}
    }
    if (sight == "foggy") {
        myoutput = {foggy: 1}
    }
    if (sight == "cloudy") {
        myoutput = {cloudy: 1}
    }

    var output = [
        'no results yet'
    ]

    var training = {
        error: '0',
        iterations: '0'
    }

    if (trainingdata.length >= 1) {
        var net = new brain.NeuralNetwork();                // Instance of a new NN
        // Train NN with all existing trainingdata - except the current one
        training = net.train(trainingdata,{
            errorThresh: 0.005,  // error threshold to reach
            iterations: 10000,   // maximum training iterations
            log: false,           // console.log() progress periodically
            logPeriod: 10,       // number of iterations between logging
            learningRate: 0.3    // learning rate
        });
        output = net.run(JSON.parse(imageData));            // Run NN to classify the current image
        output = outsort(output);
        if(output[0].indexOf(sight) > -1){
            history.unshift(1)
            successrate++;
        }else{
            history.unshift(0)
        }
    }

    rate = Math.round(successrate / history.length * 100);

    trainingdata.push({input: JSON.parse(imageData), output: myoutput});    // Add current training dataset to trainindata

    fs.createReadStream('views/images/image.jpg').pipe(fs.createWriteStream('views/images/lastimage.jpg'));     //Copy current image to lastimage
    download(getRandomImage(), 'views/images/image.jpg', function () {                                          // Download new random image
        res.render('train', {training: training, output: output, yousaid: sight, history: history, rate: rate});
    });
});

app.listen(3000, function () {
    console.log('Weather Classifier Project listening on port 3000!');
});


var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

/**
 * Returns a random webcam image
 * @returns {string}
 */
var getRandomImage = function () {
    // The list of available webcam
    var cams = ['http://www.foto-webcam.eu/webcam/fellhorn/',
        'https://www.foto-webcam.eu/webcam/pendling-ost/',
        'https://www.foto-webcam.eu/webcam/wendelstein-ost/',
        'https://www.foto-webcam.eu/webcam/wank/',
        'http://www.foto-webcam.eu/webcam/gummer/'
    ];

    // var cams = ['https://www.foto-webcam.eu/webcam/jenner-ost/']

    var d = new Date();

    // Select a random webcam
    var cam = Math.random();
    cam = Math.floor(cam * cams.length);
    cam = cams[cam];

    // Select a random month between June an now (images without snow)
    var month = 0;
    while (month < 6 || month > d.getMonth()) {
        month = Math.random();
        month = Math.ceil(month * 12 + 1).toString();
    }
    while (month.length < 2) {
        month = '0' + month;
    }

    // Select a random day
    var maxdays = 30;
    if (month == d.getMonth() + 1) {
        maxdays = d.getDay() - 1;
        if (maxdays < 1) {
            maxdays = 1;
        }
    } else if (month == 2) {
        maxdays = 28;
    }
    var day = Math.random();
    day = Math.ceil(day * maxdays).toString();
    while (day.length < 2) {
        day = '0' + day;
    }

    // Select a random hour between 8 am and 17 am (no night images)
    var hour = 0;
    while (hour < 8 || hour > 17) {
        hour = Math.random();
        hour = Math.floor(hour * 24);
    }
    hour = hour.toString() + '00';
    while (hour.length < 4) {
        hour = '0' + hour;
    }

    return cam + '2016/' + month + '/' + day + '/' + hour + '_lm.jpg';
}

/**
 * Ascending order of an array
 * @param output
 * @returns {Array}
 */
var outsort = function (output) {
    var sortresults = [];
    var sortrank = [];
    var list = [];
    for (key in output) {
        sortresults[output[key]] = key;
        sortrank.push(output[key]);
    }

    sortrank.sort(sortNumber);

    for (var i = 0; i < sortrank.length; i++) {
        var listitem = Math.round(sortrank[i] * 100000).toFixed(6) / 100000 + " | " + sortresults[sortrank[i]];
        list.push(listitem);
    }

    return list;

    function sortNumber(a, b) {
        return b - a;
    }
}
