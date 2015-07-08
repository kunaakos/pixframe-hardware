var frame =  require('./frame');
var pixels = require('./pixels');
var consolePrint = require('./consoleprint');

consolePrint.init();

pixels.init(function(pattern, palette){
  frame.init(8, 8, true, false, true, true);
  frame.setPalette(palette);
  frame.setPattern(pattern);
  consolePrint.update(pattern);
  pixels.setPatternChangeCb(function(pattern){
    frame.setPattern(pattern);
    consolePrint.update(pattern);
  });
}, false);

process.on('SIGINT', function () {
  frame.reset();
  process.nextTick(function () { process.exit(0); });
});

process.once('SIGUSR2', function () {
  frame.reset();
  process.kill(process.pid, 'SIGUSR2');
});