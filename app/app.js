var frame =  require('./frame');
var pixels = require('./pixels');
var consolePrint = require('./consoleprint');

var patternCb = function(pattern) {
  frame.setPattern(pattern);
  consolePrint.update(pattern);
};

var paletteCb = function(palette) {
  frame.setPalette(palette);
};

var doExit = function() {
  frame.reset();
  // disconnect from firebase mabeh?
  process.nextTick(function () { // read up on nextTick()
    console.log('shut it down! shut it down!');
    process.exit(0);
  });
};

consolePrint.init();
frame.init(8, 8, true, false, true, true);
pixels.init(patternCb, paletteCb);

process.on('SIGINT', function () {
  doExit();
});

process.on('SIGUSR2', function () {
  doExit();
});