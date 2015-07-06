'use strict';

var Firebase = require("firebase");

var pixels = (function() {

var _pattern = null,
    _palette = null,
    _patternChangeCb = null,
    source = new Firebase('https://pixframe.firebaseio.com/'),

  /**
  * Gets data from firebase, passes pattern and palette to callback if specified
  * NEED to _setPatternChangeCb, as this callback only fires once on init
  */
  _init = function(callback) {
    _updateData(function(){
      if (callback) callback(_pattern, _palette);
    });

    // listens for pattern changes, fires callback
    source.on('child_changed', function() {
      _getPattern(_patternChangeCb);
    });
  },

  /**
  * Sets callback that's fired every time the pattern is changed
  */
  _setPatternChangeCb = function(callback) {
    _patternChangeCb = callback;
  },

  /**
  * Gets ALL data from firebase: pattern, palette
  */
  _updateData = function(callback) {
    source.once('value', function(data) {
      _pattern = data.val().pattern;
      _palette = data.val().palette;
      if (callback) {
        callback();
      };
    });
  },

  /**
  * Gets data with _updateData(), passes fresh values to specified callback 
  */
  _getPattern = function(callback) {
    _updateData(function() {
      if (callback) {
        callback(_pattern, _palette);
      };
  })
  },

  /**
  * Updates a single pixel
  */
  _setPixel = function(row, col, val) {
    source.child('pattern/' + row + '/' + col).set(val);
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
  }


return {
    init: _init,
    set: _setPixel,
    returnPalette: _returnPalette,
    returnPattern: _returnPattern,
    getPattern: _getPattern,
    setPatternChangeCb: _setPatternChangeCb
};

})();

module.exports = pixels;