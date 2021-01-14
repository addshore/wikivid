#! /usr/bin/env node

let source = process.argv[2]
let page = process.argv[3]
let firstDateToRender = new Date(process.argv[4])
let lastDateToRender = new Date(process.argv[5])

var fs = require('fs');
var bot = require('nodemw');
var async = require('async');

let screenshot
if(source == 'local') {
  screenshot = require("./src/screenshot");
} else {
  screenshot = require("./src/screenshot-remote")
}

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

client.getArticleRevisions(page, handleArticleRevisions);

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
    let saveAs = dir + "/" + cleanPage + "@" + revision.revid + ".png";

    console.log("Getting screenshot for: " + revisionUrl)
    screenshot.ofPage(source, revisionUrl, saveAs, doneCallback)
}
