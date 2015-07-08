"use strict";

var TIME = 0;
var VALUE = 1;
var COMPUTED_TIME = 2;
var PARAMS = typeof Symbol !== "undefined" ? Symbol("PARAMS") : "_@mohayonao/envelope:PARAMS";
var COMPUTED_PARAMS = typeof Symbol !== "undefined" ? Symbol("COMPUTED_PARAMS") : "_@mohayonao/envelope:COMPUTED_PARAMS";
var DURATION = typeof Symbol !== "undefined" ? Symbol("DURATION") : "_@mohayonao/envelope:DURATION";
var PREV_SEARCH_INDEX = typeof Symbol !== "undefined" ? Symbol("PREV_SEARCH_INDEX") : "_@mohayonao/envelope:PREV_SEARCH_INDEX";
var PREV_SEARCH_TIME = typeof Symbol !== "undefined" ? Symbol("PREV_SEARCH_TIME") : "_@mohayonao/envelope:PREV_SEARCH_TIME";

function Envelope(params) {
  var duration = 0;

  if (!validate(params)) {
    throw new TypeError("The 1st argument must be [ number, number ][]");
  }

  this[PARAMS] = params;
  this[COMPUTED_PARAMS] = params.map(function(items) {
    var time = Math.max(0, items[TIME]);
    var value = items[VALUE];

    duration += time;

    return [ time, value, duration ];
  });
  this[DURATION] = duration;
  this[PREV_SEARCH_INDEX] = 0;
  this[PREV_SEARCH_TIME] = 0;

  Object.defineProperty(this, "params", { value: params });
  Object.defineProperty(this, "duration", { value: duration });
}

Envelope.adssr = function(attackTime, decayTime, sustainLevel, sustainTime, releaseTime, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, 0 ],
    [ attackTime, totalLevel ],
    [ decayTime, sustainLevel * totalLevel ],
    [ sustainTime, sustainLevel * totalLevel ],
    [ releaseTime, 0 ],
  ]);
};

Envelope.ads = function(attackTime, decayTime, sustainLevel, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, 0 ],
    [ attackTime, totalLevel ],
    [ decayTime, sustainLevel * totalLevel ],
  ]);
};

Envelope.asr = function(attackTime, sustainTime, releaseTime, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, 0 ],
    [ attackTime, totalLevel ],
    [ sustainTime, totalLevel ],
    [ releaseTime, 0 ],
  ]);
};

Envelope.prototype.valueAt = function(time) {
  var params = this[COMPUTED_PARAMS];
  var fromIndex, index, x0, x1;

  if (params.length === 0) {
    return 0;
  }

  if (time <= 0) {
    return params[0][VALUE];
  }

  if (this[DURATION] <= time) {
    return params[params.length - 1][VALUE];
  }

  if (this[PREV_SEARCH_TIME] <= time) {
    fromIndex = this[PREV_SEARCH_INDEX];
  } else {
    fromIndex = 0;
  }

  index = indexAt(params, time, fromIndex);
  x0 = clipAt(params, index - 1);
  x1 = clipAt(params, index);

  this[PREV_SEARCH_TIME] = time;
  this[PREV_SEARCH_INDEX] = index;

  return linlin(time, x0[COMPUTED_TIME], x1[COMPUTED_TIME], x0[VALUE], x1[VALUE]);
};

Envelope.prototype.applyTo = function(audioParam, playbackTime) {
  var params = this[COMPUTED_PARAMS];
  var i, imax;
  var value, time, prevValue;

  if (params.length) {
    imax = params.length;

    if (0 <= playbackTime) {
      time = params[0][COMPUTED_TIME] + playbackTime;
      audioParam.setValueAtTime(params[0][VALUE], time);
      prevValue = params[0][VALUE];

      i = 1;
    } else {
      for (i = 0; i < imax; i++) {
        time = params[i][COMPUTED_TIME] + playbackTime;

        if (0 <= time) {
          value = this.valueAt(-playbackTime);
          audioParam.setValueAtTime(value, 0);
          prevValue = value;
          break;
        }
      }
    }

    for (; i < imax; i++) {
      time = params[i][COMPUTED_TIME] + playbackTime;

      if (params[i][VALUE] === prevValue) {
        audioParam.setValueAtTime(params[i][VALUE], time);
      } else {
        audioParam.linearRampToValueAtTime(params[i][VALUE], time);
      }

      prevValue = params[i][VALUE];
    }
  }

  return this;
};

Envelope.prototype.map = function(fn) {
  return new Envelope(this[PARAMS].map(fn));
};

function defaults(value, defalutValue) {
  return typeof value !== "undefined" ? value : defalutValue;
}

function validate(params) {
  return Array.isArray(params) && params.every(function(items) {
    return Array.isArray(items) && typeof items[0] === "number" && typeof items[1] === "number";
  });
}

function indexAt(params, time, fromIndex) {
  var i, imax;

  for (i = fromIndex, imax = params.length; i < imax; i++) {
    if (time < params[i][COMPUTED_TIME]) {
      return i;
    }
  }

  return params.length - 1;
}

function clipAt(list, index) {
  return list[Math.max(0, Math.min(index, list.length - 1))];
}

function linlin(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
}

module.exports = Envelope;
