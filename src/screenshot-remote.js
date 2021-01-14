var fs = require('fs');
const http = require('http'); // or 'https' for https:// URLs

function ofPage(source, url, saveAs, doneCallback){
    // TODO allow some way to force over it?
    if (fs.existsSync(saveAs)) {
        console.log('Using cached local screenshot for: ' + saveAs);
        doneCallback();
        return
    }

    const file = fs.createWriteStream(saveAs);
    http.get(source + "/" + url, function(response) {
        response.pipe(file);
        doneCallback()
    });

}

module.exports = { ofPage };