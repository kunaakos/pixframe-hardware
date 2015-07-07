var frame = (function() {
  var _leds = require('rpi-ws281x-native'),
      _NUM_LEDS = 60,
      _initialized = false,
      _paletteRGB = null,
      _targetPattern = null,
      _currentPattern = null,
      _fadeInterval = null,

      /**
       * Initialises ws281x leds
       */
      _init = function(pattern, palette){
        _leds.init(_NUM_LEDS);
        _setPattern(pattern, palette);
        _currentPattern = _patternToRGB(pattern);
        _initialized = true;
      },

      /**
       * Resets ws281x leds
       */
      _reset = function() {
        _leds.reset();
      },

      /**
       * Updates _targetPattern
       */
      _setPattern = function(pattern, palette) {
        palette[0] = '#000000';
        _paletteRGB = _paletteToRGB(palette);
        _targetPattern = _patternToRGB(pattern);
        if (!_fadeInterval) {
          _fadeInterval = setInterval(function(){
            if (!_refreshLEDs()) {
              clearInterval(_fadeInterval);
              _fadeInterval = null;
              // console.log('cleared int');
            }
          }, 4); //4ms is ~24-25fps

        }
      },

      _patternToRGB = function(pattern){
        var buf = [];
        while(buf.push([]) < pattern.length){}
        pattern.forEach(function(row, rowIndex){
          row.forEach(function(currentVal, colIndex){
            buf[rowIndex][colIndex] = _paletteRGB[currentVal];
          });
        });
        return buf;
      },

      _paletteToRGB = function(palette)  {
        var paletteRGB = [];
        palette.forEach(function(HEXcolor, index){
          paletteRGB[index] = _HEXToRGB(HEXcolor);
        });
        return paletteRGB;
      },

      /**
       * Updates ws281x leds, handles fading
       * returns true if fading was needed, false if not
       */
      _refreshLEDs = function() {
        var stillFading = false;
        if (_currentPattern && _paletteRGB) {
          _currentPattern.forEach(function(row, rowIndex){
            row.forEach(function(currentVal, colIndex){
                if(_fadeLED(rowIndex, colIndex)) {
                  stillFading = true;
                }
            });
          });
        }
        _leds.render(_patternToPixelData(_currentPattern, true, false, true, true));
        return stillFading;
      },

      /**
       * Fades a single led
       * returns true if fading was needed, false if not
       */
      _fadeLED = function(row, col) {
        var currentColor = _currentPattern[row][col];
        var targetColor = _targetPattern[row][col];
        var stillFading = false;

        currentColor.forEach(function(c, ci){
          if (Math.abs(c - targetColor[ci]) < 8) {
            currentColor[ci] = targetColor[ci];
          } else if (c > targetColor[ci]) {
            currentColor[ci] = currentColor[ci] - 8;
            stillFading = true;
          } else if (c < targetColor[ci]) {
            currentColor[ci] = currentColor[ci] + 8;
            stillFading = true;
          } else {
            return false;
          }
        });

        _currentPattern[row][col] = currentColor.slice();
        return stillFading;
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
        var patternBuf = pattern.map(function(arr) {
            return arr.slice();
        });
        var row = 0;

        if (upsideDown) {
          patternBuf = patternBuf.reverse();
        }

        if (mirrored) {
          for ( row = 0; row < rows; row++) {
            patternBuf[row] = patternBuf[row].reverse();
          }
        }

        if (zigZag) {
          for ( row = 0; row < rows; row++) {
            if (Boolean(row % 2) === firstLTR) {
              patternBuf[row] = patternBuf[row].reverse();
            }
          }
        }

        for ( row = 0; row < rows; row++) {
          for (var column = 0; column < columns; column++) {
            pixelDataBuf[row * rows + column] =  _RGBToInt(patternBuf[row][column]);
          }
        }

        return pixelDataBuf;
      },

      /**
      * Converts HEX color code #XXXXXX to RGB
      */
      _HEXToRGB = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ];
      },

      /**
      * Converts RGB color code to integer for ws281x
      */
      _RGBToInt = function(rgb) {
        return ((rgb[0] & 0xff) << 16) + ((rgb[1] & 0xff) << 8) + (rgb[2] & 0xff);
      };

  return {
    init: _init,
    reset: _reset,
    setPattern: _setPattern
  };
})();

module.exports = frame; 