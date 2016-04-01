var frame = (function() {

  var _leds = require('rpi-ws281x-native'),
      _paletteRGB = null,
      _targetPatternIndexed = null, //store a non-RGB version, needed when pallette changes
      _targetPattern = null,
      _currentPattern = null,
      _fadeInterval = null,

      /**
       * Initialises ws281x leds
       */
      _init = function(rows, columns, upsideDown, mirrored, zigZag, firstLTR){
        _leds.init(rows*columns);
        _leds.setIndexMapping(_generateSourceMap(rows, columns, upsideDown, mirrored, zigZag, firstLTR));
        _currentPattern = _createArray(rows, columns, [0,0,0]); // dark on init;
      },

      /**
       * Resets ws281x leds
       */
      _reset = function() {
        _leds.reset();
      },

      /**
       * Updates _paletteRGB
       */
      _setPalette = function(palette){
        _paletteRGB = _paletteToRGB(palette);
        if (_targetPatternIndexed) {
          _setPattern(_targetPatternIndexed); //trigger refresh with new colors
        }
      },

      /**
       * Updates _targetPattern
       */
      _setPattern = function(pattern) {
        _targetPatternIndexed = pattern;
        if (_paletteRGB) {
          _targetPattern = _patternToRGB(pattern);
          _startFade();
        }
      },

      /**
       * Pattern received is an array of palette indexes
       * Returns an array of [r, g, b] values for use in this module
       */
      _patternToRGB = function(pattern){
        var buf = [];
        var len = pattern.length;
        while(buf.push([]) < len){}
        pattern.forEach(function(row, rowIndex){
          row.forEach(function(currentVal){
            buf[rowIndex].push(_paletteRGB[currentVal]);
          });
        });
        return buf;
      },

      /**
       * Palette received is an arra of HEX color codes
       * Returns an array of [r, g, b] values for use in this module
       */
      _paletteToRGB = function(palette)  {
        var paletteRGB = [];
        palette.forEach(function(HEXcolor){
          paletteRGB.push(_HEXToRGB(HEXcolor));
        });
        paletteRGB[0] = _HEXToRGB('#000000'); // 0 is always black on frame
        return paletteRGB;
      },

      _startFade = function() {
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

      /**
       * Updates ws281x leds, handles fading
       * returns true if fading was needed, false if not
       */
      _refreshLEDs = function() {
        var stillFading = false;
        var rows = _currentPattern.length;
        var columns = _currentPattern[0].length;

        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < columns; col++) {
              if(_fadeLED(row, col)) {
                stillFading = true;
              }
            }
        }
        _leds.render(_patternToPixelData(_currentPattern));

        return stillFading;
      },

      /**
       * Fades a single led
       * returns true if fading was needed, false if not
       * NOTE: needs better algorithm
       */
      _fadeLED = function(row, col) {
        var currentColor = _currentPattern[row][col];
        var targetColor = _targetPattern[row][col];
        var stillFading = false;

        for (var ci = 0; ci < 3; ci++) {
          if (Math.abs(currentColor[ci] - targetColor[ci]) < 8) {
            currentColor[ci] = targetColor[ci];
          } else if (currentColor[ci] > targetColor[ci]) {
            currentColor[ci] = currentColor[ci] - 8;
            stillFading = true;
          } else if (currentColor[ci] < targetColor[ci]) {
            currentColor[ci] = currentColor[ci] + 8;
            stillFading = true;
          } else {
            return false;
          }
        }

        return stillFading;
      },

      /**
       * Returns pixelData to be sent to ws218x leds
       */
      _patternToPixelData = function(pattern) {
        var rows = pattern.length;
        var columns = pattern[0].length;
        var pixelDataBuf = new Uint32Array(rows * columns);

        for (var row = 0; row < rows; row++) {
          for (var column = 0; column < columns; column++) {
            pixelDataBuf[row * rows + column] =  _RGBToInt(pattern[row][column]);
          }
        }

        return pixelDataBuf;
      },

      /**
       * Generates a source map for ws281x lib
       *
       * pattern is a 2d array
       * upsideDown: true if rows on matrix start from the bottom
       * mirrored: mirrors the image if true
       * zigZag: true if led strips are wired up in an "S" pattern
       * firstLTR: used with zigZag, true if the first row needs to be left to right
       */
      _generateSourceMap = function(rows, columns, upsideDown, mirrored, zigZag, firstLTR) {
        var row = 0;
        var map2d = _createArray(rows, columns, false);
        var map = [];

        if (upsideDown) {
          map2d = map2d.reverse();
        }

        if (mirrored) {
          for (row = 0; row < rows; row++) {
            map2d[row] = map2d[row].reverse();
          }
        }

        if (zigZag) {
          firstLTR = firstLTR;
          for (row = 0; row < rows; row++) {
            if (Boolean(row % 2) === firstLTR) {
              map2d[row] = map2d[row].reverse();
            }
          }
        }

        map = map.concat.apply(map, map2d);
        return map;
      },

      _createArray = function(rows, columns, fillValue){
        var arr = [];
        for (var row = 0; row < rows; row++) {
          arr.push([]);
          for (var col = 0; col < columns; col++) {
            if (fillValue) {
              if (fillValue.constructor === Array) {
                arr[row].push(fillValue.slice());
              } else {
                arr[row].push(fillValue);
              }
            } else {
              arr[row].push(row * columns + col);
            }
          }
        }
        return arr;
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
    setPattern: _setPattern,
    setPalette: _setPalette
  };

})();

module.exports = frame;
