var frame =  require('./frame');
var pixels = require('./pixels');
var consolePrint = require('./consoleprint');

frame.init();
consolePrint.init();

pixels.init(function(pattern, palette){
  frame.displayPattern(pattern, palette);
  consolePrint.update(pattern);
}, true);

process.on('SIGINT', function () {
  frame.reset();
  process.nextTick(function () { process.exit(0); });
});

process.once('SIGUSR2', function () {
  frame.reset();
  process.kill(process.pid, 'SIGUSR2');
});