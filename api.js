var http = require('http');
var fs = require('fs');
var screenshot = require('./src/screenshot.js');

// From https://stackoverflow.com/a/5717133/4746236
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

http.createServer(function (request, response) {
    let urlToFetch = request.url.slice(1)
    if(!validURL(urlToFetch)) {
        console.log("Invalid URL request: " + urlToFetch)
        response.writeHead(500);
        response.end('ERROR: '+"Invalid URL request: " + urlToFetch + "\n");
        return
    }
    if(!urlToFetch.startsWith("https://en.wikipedia.org/w")) {
        console.log("Not an enwiki URL: " + urlToFetch)
        response.writeHead(500);
        response.end('ERROR: '+"Not an enwiki URL: " + urlToFetch + "\n");
        return
    }

    // TODO validate that it is a mw / wm / wp domain etc? (if we deploy this somewhere)

    console.log('Requesting: ', urlToFetch);

    let saveAs = '/tmp/wikigif-' + urlToFetch + ".png"
    saveAs = saveAs.replace(/[/\\?%*:|"<>]/g, '-')

    screenshot.ofPage("local",urlToFetch,saveAs,screenshotGrabbed)

    function screenshotGrabbed() {
        fs.readFile(saveAs, function(error, content) {
            if (error) {
                response.writeHead(500);
                response.end('ERROR: '+error.code+' ..\n');
            }
            else {
                response.writeHead(200, { 'Content-Type': 'image/png' });
                response.end(content, 'utf-8');
                fs.unlinkSync(saveAs)
            }
        });
    }

}).listen(8125);
console.log('Server running at http://127.0.0.1:8125/');