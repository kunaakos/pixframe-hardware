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

consolePrint.init();

frame.init(8, 8, true, false, true, true);
pixels.init(patternCb, paletteCb);

process.on('SIGINT', function () {
  frame.reset();
  process.nextTick(function () { process.exit(0); });
});

process.once('SIGUSR2', function () {
  frame.reset();
  process.kill(process.pid, 'SIGUSR2');
});