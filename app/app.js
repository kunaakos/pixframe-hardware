var frame =  require('./frame')
var pixels = require('./pixels');
var consolePrint = require('./consoleprint');

frame.init();
pixels.init(frame.displayPattern);
consolePrint.init();

pixels.setPatternChangeCb(function(pattern, palette){
	frame.displayPattern(pattern, palette);
	consolePrint.update(pattern);
});

process.on('SIGINT', function () {
  frame.reset();
  process.nextTick(function () { process.exit(0); });
});