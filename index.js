"use strict";

var TIME = 0;
var VALUE = 1;
var CURVE = 2;
var COMPUTED_TIME = 3;
var LINEAR = 0;
var EXPONENTIAL = 1;
var ZERO = 1e-4;
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
    var curve = Math.max(0, Math.min(items[CURVE]|0, 1));

    duration += time;

    return [ time, value, curve, duration ];
  });
  this[DURATION] = duration;
  this[PREV_SEARCH_INDEX] = 0;
  this[PREV_SEARCH_TIME] = 0;
}

Envelope.adssr = function(attackTime, decayTime, sustainLevel, sustainTime, releaseTime, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, 0, LINEAR ],
    [ attackTime, totalLevel, LINEAR ],
    [ decayTime, sustainLevel * totalLevel, EXPONENTIAL ],
    [ sustainTime, sustainLevel * totalLevel, LINEAR ],
    [ releaseTime, ZERO, EXPONENTIAL ],
    [ 0, 0, LINEAR ],
  ]);
};

Envelope.ads = function(attackTime, decayTime, sustainLevel, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, 0, LINEAR ],
    [ attackTime, totalLevel, LINEAR ],
    [ decayTime, sustainLevel * totalLevel, EXPONENTIAL ],
  ]);
};

Envelope.asr = function(attackTime, sustainTime, releaseTime, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, 0, LINEAR ],
    [ attackTime, totalLevel, LINEAR ],
    [ sustainTime, totalLevel, LINEAR ],
    [ releaseTime, ZERO, EXPONENTIAL ],
    [ 0, 0, LINEAR ],
  ]);
};

Envelope.a = function(attackTime, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, 0, LINEAR ],
    [ attackTime, totalLevel, LINEAR ],
  ]);
};

Envelope.dssr = function(decayTime, sustainLevel, sustainTime, releaseTime, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, totalLevel, LINEAR ],
    [ decayTime, sustainLevel * totalLevel, EXPONENTIAL ],
    [ sustainTime, sustainLevel * totalLevel, LINEAR ],
    [ releaseTime, ZERO, EXPONENTIAL ],
    [ 0, 0, LINEAR ],
  ]);
};

Envelope.ds = function(decayTime, sustainLevel, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, totalLevel, LINEAR ],
    [ decayTime, sustainLevel * totalLevel, EXPONENTIAL ],
  ]);
};

Envelope.r = function(releaseTime, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, totalLevel, LINEAR ],
    [ releaseTime, ZERO, EXPONENTIAL ],
    [ 0, 0, LINEAR ],
  ]);
};

Envelope.cutoff = function(releaseTime, totalLevel) {
  totalLevel = defaults(totalLevel, 1);

  return new Envelope([
    [ 0, totalLevel, LINEAR ],
    [ releaseTime, 0, LINEAR ],
  ]);
};

Object.defineProperties(Envelope.prototype, {
  params: {
    get: function() {
      return this[PARAMS].map(function(items) {
        return items.slice();
      });
    },
    configurable: true, enumerable: false,
  },
  duration: {
    get: function() {
      return this[DURATION];
    },
    configurable: true, enumerable: false,
  },
});

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

  if (x1[CURVE] === EXPONENTIAL) {
    return linexp(time, x0[COMPUTED_TIME], x1[COMPUTED_TIME], x0[VALUE], x1[VALUE]);
  }

  return linlin(time, x0[COMPUTED_TIME], x1[COMPUTED_TIME], x0[VALUE], x1[VALUE]);
};

Envelope.prototype.applyTo = function(audioParam, playbackTime) {
  var params = this[COMPUTED_PARAMS];
  var i, imax;
  var time, prevValue, prevTime;

  if (params.length) {
    imax = params.length;

    time = params[0][COMPUTED_TIME] + playbackTime;
    prevValue = params[0][VALUE];
    prevTime = time;

    for (i = 1; i < imax; i++) {
      time = params[i][COMPUTED_TIME] + playbackTime;

      if (params[i][VALUE] === prevValue) {
        audioParam.setValueAtTime(params[i][VALUE], time);
      } else {
        if (time === prevTime) {
          time += 0.0001;
        }
        audioParam.setValueAtTime(prevValue, prevTime);
        if (params[i][CURVE] === EXPONENTIAL) {
          audioParam.exponentialRampToValueAtTime(params[i][VALUE], time);
        } else {
          audioParam.linearRampToValueAtTime(params[i][VALUE], time);
        }
      }

      prevValue = params[i][VALUE];
      prevTime = time;
    }
  }

  return this;
};

Envelope.prototype.map = function(fn) {
  return new Envelope(this[PARAMS].map(fn));
};

Envelope.prototype.madd = function(mul, add) {
  mul = defaults(mul, 1);
  add = defaults(add, 0);

  return new Envelope(this[PARAMS].map(function(items) {
    return [ items[TIME], items[VALUE] * mul + add, items[CURVE] ];
  }));
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

function linexp(value, inMin, inMax, outMin, outMax) {
  return Math.pow(outMax / outMin, (value - inMin) / (inMax - inMin)) * outMin;
}

module.exports = Envelope;
