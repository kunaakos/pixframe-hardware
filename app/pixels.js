'use strict';

var Firebase = require("firebase");

var pixels = (function() {

  var _pattern = null,
      _palette = null,
      _patternChangeCb = null,
      _paletteChangeCb = null,
      _firebase = new Firebase('https://pixframe.firebaseio.com/'),
      _patternSource = _firebase.child('pattern'),
      _paletteSource = _firebase.child('palette'),

    /**
    * Gets data from firebase, passes pattern and palette to callback if specified
    * uses callback on pattern change if setAsPatternChangeCb is true
    */
    _init = function(patternChangeCb, paletteChangeCb) {
      // sets callbacks
      _patternChangeCb = patternChangeCb;
      _paletteChangeCb = paletteChangeCb;

      // listens for pattern changes, fires callback
      _patternSource.on('value', function(data) {
        _patternChangeCb(data.val());
      });

      // listens for palette changes, fires callback
      _paletteSource.on('value', function(data) {
        _paletteChangeCb(data.val());
      });
    },

    /**
    * Sets callback that's fired every time the pattern is changed
    */
    _setPatternChangeCb = function(callback) {
      _patternChangeCb = callback;
    },

    /**
    * Sets callback that's fired every time the palette is changed
    */
    _setPaletteChangeCb = function(callback) {
      _paletteChangeCb = callback;
    },

    /**
    * Updates a single pixel
    */
    _setPixel = function(row, col, val) {
      _pattern.child(row + '/' + col).set(val);
    },

    /**
    * Returns the current pattern
    */
    _returnPattern = function() {
      return _pattern;
    },

    /**
    * Returns the current palette
    */
    _returnPalette = function() {
      return _palette;
    };

  return {
      init: _init,
      set: _setPixel,
      returnPalette: _returnPalette,
      returnPattern: _returnPattern,
      setPatternChangeCb: _setPatternChangeCb,
      setPaletteChangeCb: _setPaletteChangeCb
  };

})();

module.exports = pixels;