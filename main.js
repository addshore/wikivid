#! /usr/bin/env node

let page = '2021_storming_of_the_United_States_Capitol'
//let page = 'User:Addshore/foo'
let imageSeconds = 1/30
// For the US page this means 2.6 mins...
// TODO maybe we should skip some revisions..

var webshot = require('webshot');
var fs = require('fs');
var bot = require('nodemw');
var async = require('async');
var del = require('del');
var videoshow = require('videoshow');

let dir = './data';
try{
    fs.mkdirSync(dir);
}catch(e){}
dir = dir + "/" + page;
try{
    fs.mkdirSync(dir);
}catch(e){}

var client = new bot({
  protocol: 'https',
  server: 'en.wikipedia.org',
  path: '/w',
  debug: false
});

downloadScreenshotsOfArticleRevisions(page)
// TODO make gif from images?

function downloadScreenshotsOfArticleRevisions(page) {
    client.getArticleRevisions(page, handleArticleRevisions);
}

function handleArticleRevisions(err, data) {
    if (err) {
      console.error(err);
      return;
    }

    console.log("Got " + data.length + " revisions")

    async.eachLimit(data, 20, handleArticleRevision, function(err) {
        if(err) throw err;

        var screenshots = fs.readdirSync(dir + "/");
        screenshots = screenshots.map(function(file) { 
            return dir + '/' + file; 
          })
        console.log("Got " + screenshots.length + " screenshots");

        var videoOptions = {
            fps: 30,
            loop: imageSeconds, // seconds
            transition: false,
            transitionDuration: 1, // seconds
            videoBitrate: 1024,
            videoCodec: 'libx264',
            size: '1920x?',
            audioBitrate: '128k',
            audioChannels: 2,
            format: 'mp4',
            pixelFormat: 'yuv420p'
          }

          videoshow(screenshots, videoOptions)
            .save(dir + '/' + page.replace(/[|&;$%@"<>()+,\/:]/g, "") + '.mp4')
            .on('start', function (command) {
                console.log('ffmpeg process started:', command)
            })
            .on('error', function (err, stdout, stderr) {
                console.error('Error:', err)
                console.error('ffmpeg stderr:', stderr)
            })
            .on('end', function (output) {
                console.error('Video created in:', output)
            })

    });
}

function handleArticleRevision(revision, doneCallback) {
    let revisionUrl = "https://en.wikipedia.org/w/index.php?title=" + page + "&oldid=" + revision.revid;
    let cleanPage = page.replace(/[|&;$%@"<>()+,\/:]/g, "");
    let saveAs = cleanPage + "@" + revision.revid;

    getScreenshotOfPage(revisionUrl, saveAs, doneCallback)
}

function getScreenshotOfPage(url, saveAs, doneCallback){

    // TODO hide annoying elements?
    const optionsSelector = {
        //captureSelector: '#content',
        screenSize: {
            width: 1920,
            height: 1080
          },
          shotSize: {
            width: 'all',
            height: 'all'
          },
    };

    var fileToSave = dir + "/" + saveAs + ".png";

    if (fs.existsSync(fileToSave)) {
        console.log('Screenshot already retrieved: ' + fileToSave);
        doneCallback();
        return
    }

    webshot(url, dir + "/" + saveAs + ".png", optionsSelector, function(err) {
        if (err) {
          console.log('Screenshot failed!');
        }
        console.log('Got screenshot from: ' + url);
        doneCallback();
      });

}