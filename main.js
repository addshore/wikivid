#! /usr/bin/env node

let page = '2021_storming_of_the_United_States_Capitol'
let firstDateToRender = new Date( '2021-01-06T18:34:29Z' )
let lastDateToRender = new Date( '2021-01-07T00:00:01Z' )// up to midnight..
//let lastDateToRender = new Date( '2021-01-07T18:34:29Z' )// 24 hours later
//let page = 'User:Addshore/foo'

var fs = require('fs');
var bot = require('nodemw');
var async = require('async');
const screenshot = require("./src/screenshot");

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

    screenshot.ofPage(revisionUrl, saveAs, doneCallback)
}
