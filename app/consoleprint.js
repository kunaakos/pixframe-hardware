var consolePrint = (function() {
  var _initialized = false;

      _init = function(){
        _clear();
        console.log('initialized');
        _initialized = true;
      },

      _clear = function() {
        process.stdout.write('\033c');
      },

      _update = function(pattern) {
        var rows = pattern.length,
            columns = pattern[0].length;
        _clear();
        console.log(rows + 'x' + columns + ' matrix, current pattern:\n')
        for (var i = 0; i < rows; i++) {
          console.log(pattern[i].join('\t')+'\n\n');
        };
        console.log('Press <ctrl>+C to exit.');
      },

      _hexToInt = function(hex) {
        var result = /^#?([a-f\d]{6})$/i.exec(hex);
        return result ? parseInt(result[1], 16) : null;
      }

  return {
    init: _init,
    clear: _clear,
    update: _update
  };
})();

module.exports = consolePrint; 