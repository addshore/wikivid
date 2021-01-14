#! /usr/bin/env node

let page = '2021_storming_of_the_United_States_Capitol'
let firstDateToRender = new Date( '2021-01-06T18:34:29Z' )
let lastDateToRender = new Date( '2021-01-07T06:34:29Z' )// 12 hours later
//let lastDateToRender = new Date( '2021-01-07T18:34:29Z' )// 24 hours later
//let page = 'User:Addshore/foo'
let imageSeconds = 1/30
// For the US page this means 2.6 mins...
// TODO maybe we should skip some revisions..

var webshot = require('webshot');
var fs = require('fs');
var bot = require('nodemw');
var async = require('async');

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

    async.eachLimit(data, 10, handleArticleRevision, function(err) {
        if(err) throw err;

        var screenshots = fs.readdirSync(dir + "/");
        screenshots = screenshots.map(function(file) { 
            return dir + '/' + file; 
          })
        console.log("Got " + screenshots.length + " screenshots");
    });
}

function handleArticleRevision(revision, doneCallback) {
  let revDate = new Date(revision.timestamp);
    if( revDate < firstDateToRender || revDate > lastDateToRender ) {
      console.log("Skipping " + revision.revid + " as out of date range.")
      doneCallback()
      return;
    }

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