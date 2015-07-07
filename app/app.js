var frame =  require('./frame');
var pixels = require('./pixels');
var consolePrint = require('./consoleprint');

consolePrint.init();

pixels.init(function(pattern, palette){
  frame.init(pattern, palette);
  frame.setPattern(pattern, palette);
  pixels.setPatternChangeCb(function(pattern, palette){
    frame.setPattern(pattern, palette);
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