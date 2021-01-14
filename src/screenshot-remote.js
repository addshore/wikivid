var fs = require('fs');
const http = require('http');
const https = require('https');

function ofPage(source, url, saveAs, doneCallback){
    // TODO allow some way to force over it?
    if (fs.existsSync(saveAs)) {
        console.log('Using cached local screenshot for: ' + saveAs);
        doneCallback();
        return
    }

    if(source.substring(0,5)=='https') {
        const file = fs.createWriteStream(saveAs);
        https.get(source + "/" + url, function(response) {
            response.pipe(file);
            doneCallback()
        });
    } else {
        const file = fs.createWriteStream(saveAs);
        http.get(source + "/" + url, function(response) {
            response.pipe(file);
            doneCallback()
        });
    }



}

module.exports = { ofPage };