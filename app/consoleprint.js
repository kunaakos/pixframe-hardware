var consolePrint = (function() {
  var _initialized = false,

      _init = function(){
        _clear();
        console.log('initialized');
        _initialized = true;
      },

      _clear = function() {
        process.stdout.write('\033c');
      },

      _update = function(pattern) {
        _clear();
        console.log('Current pattern:');
        console.log(pattern);
        console.log('Press <ctrl>+C to exit.');
      };

  return {
    init: _init,
    clear: _clear,
    update: _update
  };
})();

module.exports = consolePrint; 