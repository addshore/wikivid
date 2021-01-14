var webshot = require('webshot');
var fs = require('fs');

function ofPage(url, saveAs, doneCallback){
    // TODO hide annoying elements?
    const optionsSelector = {
        // If we want to limit what we grab we could use this
        //captureSelector: '#content',
        customCSS: '.mw-revision, .warningbox { display:none; }',
        // wait a short time to make sure the page looks as ready as possible
        renderDelay: 200,
        screenSize: {
            width: 1920,
            height: 1080
          },
          shotSize: {
            width: 1920,
            height: 'all'
          },
    };

    // TODO allow some way to force over it?
    if (fs.existsSync(saveAs)) {
        console.log('Screenshot already retrieved: ' + saveAs);
        doneCallback();
        return
    }

    webshot(url, saveAs, optionsSelector, function(err) {
        if (err) {
          console.log('Screenshot failed!');
          console.log(err);
        }
        console.log('Got screenshot from: ' + url);
        doneCallback();
      });

}

module.exports = { ofPage };