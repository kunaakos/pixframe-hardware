var frame = (function() {
  var _leds = require('rpi-ws281x-native'),
      _NUM_LEDS = 60,
      _pixelData = new Uint32Array(_NUM_LEDS),
      _initialized = false,
      _palette = null,

      /**
       * Initialises ws281x leds
       */
      _init = function(){
        _leds.init(_NUM_LEDS);
        _initialized = true;
      },

      /**
       * Resets ws281x leds
       */
      _reset = function() {
        _leds.reset();
      },

      /**
       * Updates ws281x leds
       */
      _displayPattern = function(pattern, palette) {
        _palette = palette;
        _palette[0] = '#000000'; // white = led off
        _pixelData = _patternToPixelData(pattern, true, false, true, true);
        if (_initialized) {
          _leds.render(_pixelData);
        };
      },

      /**
       * Manipulates pattern array and generates pixelData to be sent to ws218x leds
       * Used this instead of .setIndexMapping() as it is easier and cleaner
       *
       * pattern is a 2d array
       * upsideDown: true if rows on matrix start from the bottom
       * mirrored: mirrors the image if true
       * zigZag: true if led strips are wired up in an "S" pattern
       * firstLTR: used with zigZag, true if the first row needs to be left to right
       */
      _patternToPixelData = function(pattern, upsideDown, mirrored, zigZag, firstLTR) {
        var rows = pattern.length;
        var columns = pattern[0].length;
        var pixelDataBuf = new Uint32Array(_NUM_LEDS);
        var patternBuf = pattern.slice();
        
        if (upsideDown) {
          patternBuf = patternBuf.reverse();
        };

        if (mirrored) {
          for (var row = 0; row < rows; row++) {
            patternBuf[row] = patternBuf[row].reverse();
          };
        };

        if (zigZag) {
          for (var row = 0; row < rows; row++) {
            if (Boolean(row % 2) == firstLTR) {
              patternBuf[row] = patternBuf[row].reverse();
            }
          };
        };

        for (var row = 0; row < rows; row++) {
          for (var column = 0; column < columns; column++) {
            pixelDataBuf[row * rows + column] =  _hexToInt(_palette[patternBuf[row][column]]);
          };
        };

        return pixelDataBuf;
      },

      /**
      * Converts HEX color code #XXXXXX to integer for ws281x
      */
      _hexToInt = function(hex) {
        var result = /^#?([a-f\d]{6})$/i.exec(hex);
        return result ? parseInt(result[1], 16) : null;
      }

  return {
    init: _init,
    reset: _reset,
    displayPattern: _displayPattern
  };
})();

module.exports = frame; 