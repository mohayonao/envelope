"use strict";

var assert = require("power-assert");
var sinon = require("sinon");
var Envelope = require("../");

function closeTo(expected, actual, delta) {
  return Math.abs(expected - actual) <= delta;
}

describe("Envelope", function() {
  describe("constructor(params: [ time: number, value: number ][])", function() {
    it("works", function() {
      var env = new Envelope([]);

      assert(env instanceof Envelope);

      assert.throws(function() {
        return new Envelope([ 0, 0, 1, 1 ]);
      }, function(e) {
        return e instanceof TypeError && /the 1st argument must be/i.test(e.message);
      });
    });
  });
  describe(".adssr(attackTime: number, decayTime: number, sustainLevel: number, sustainTime: number, releaseTime: number, totalLevel: number = 1)", function() {
    it("works", function() {
      var env = Envelope.adssr(0.5, 0.2, 0.4, 1.0, 0.4);

      assert(env instanceof Envelope);
      assert.deepEqual(env.params, [
        [ 0, 0, 0 ], [ 0.5, 1, 0 ], [ 0.2, 0.4, 1 ], [ 1.0, 0.4, 0 ], [ 0.4, 1e-4, 1 ], [ 0, 0, 0 ],
      ]);
    });
    it("works with totalLevel", function() {
      it("works", function() {
        var env = Envelope.adssr(0.5, 0.2, 0.4, 1.0, 0.4, 0.5);

        assert(env instanceof Envelope);
        assert.deepEqual(env.params, [
          [ 0, 0, 0 ], [ 0.5, 0.5, 0 ], [ 0.2, 0.2, 1 ], [ 1.0, 0.2, 0 ], [ 0.4, 1e-4, 1 ], [ 0, 0, 0 ],
        ]);
      });
    });
  });
  describe(".ads(attackTime: number, decayTime: number, sustainLevel: number, totalLevel = 1)", function() {
    it("works", function() {
      var env = Envelope.ads(0.5, 0.2, 0.4);

      assert(env instanceof Envelope);
      assert.deepEqual(env.params, [
        [ 0, 0, 0 ], [ 0.5, 1, 0 ], [ 0.2, 0.4, 1 ],
      ]);
    });
    it("works with totalLevel", function() {
      var env = Envelope.ads(0.5, 0.2, 0.4, 0.5);

      assert(env instanceof Envelope);
      assert.deepEqual(env.params, [
        [ 0, 0, 0 ], [ 0.5, 0.5, 0 ], [ 0.2, 0.2, 1 ],
      ]);
    });
  });
  describe(".asr(attackTime: number, sustainTime: number, releaseTime: number, totalLevel: number = 1)", function() {
    it("works", function() {
      var env = Envelope.asr(0.5, 1.0, 0.4);

      assert(env instanceof Envelope);
      assert.deepEqual(env.params, [
        [ 0, 0, 0 ], [ 0.5, 1, 0 ], [ 1.0, 1, 0 ], [ 0.4, 1e-4, 1 ], [ 0, 0, 0 ],
      ]);
    });
    it("works with totalLevel", function() {
      it("works", function() {
        var env = Envelope.asr(0.5, 1.0, 0.4, 0.5);

        assert(env instanceof Envelope);
        assert.deepEqual(env.params, [
          [ 0, 0, 0 ], [ 0.5, 0.5, 0 ], [ 1.0, 0.5, 0 ], [ 0.4, 1e-4, 1 ], [ 0, 0, 0 ],
        ]);
      });
    });
  });
  describe(".a(attackTime: number, totalLevel: number = 1)", function() {
    it("works", function() {
      var env = Envelope.a(0.5);

      assert(env instanceof Envelope);
      assert.deepEqual(env.params, [
        [ 0, 0, 0 ], [ 0.5, 1, 0 ],
      ]);
    });
    it("works with totalLevel", function() {
      it("works", function() {
        var env = Envelope.asr(0.5, 0.5);

        assert(env instanceof Envelope);
        assert.deepEqual(env.params, [
          [ 0, 0, 0 ], [ 0.5, 0.5, 0 ],
        ]);
      });
    });
  });
  describe(".dssr(decayTime: number, sustainLevel: number, sustainTime: number, releaseTime: number, totalLevel: number = 1)", function() {
    it("works", function() {
      var env = Envelope.dssr(0.2, 0.4, 1.0, 0.4);

      assert(env instanceof Envelope);
      assert.deepEqual(env.params, [
        [ 0, 1, 0 ], [ 0.2, 0.4, 1 ], [ 1.0, 0.4, 0 ], [ 0.4, 1e-4, 1 ], [ 0, 0, 0 ],
      ]);
    });
    it("works with totalLevel", function() {
      it("works", function() {
        var env = Envelope.dssr(0.2, 0.4, 1.0, 0.4, 0.5);

        assert(env instanceof Envelope);
        assert.deepEqual(env.params, [
          [ 0, 0.5, 0 ], [ 0.2, 0.2, 1 ], [ 1.0, 0.2, 0 ], [ 0.4, 1e-4, 1 ], [ 0, 0, 0 ],
        ]);
      });
    });
  });
  describe(".ds(decayTime: number, sustainLevel: number, totalLevel: number = 1)", function() {
    it("works", function() {
      var env = Envelope.ds(0.2, 0.4);

      assert(env instanceof Envelope);
      assert.deepEqual(env.params, [
        [ 0, 1, 0 ], [ 0.2, 0.4, 1 ],
      ]);
    });
    it("works with totalLevel", function() {
      it("works", function() {
        var env = Envelope.ds(0.2, 0.4, 0.5);

        assert(env instanceof Envelope);
        assert.deepEqual(env.params, [
          [ 0, 0.5, 0 ], [ 0.2, 0.2, 1 ],
        ]);
      });
    });
  });
  describe(".r(releaseTime: number, totalLevel: number = 1)", function() {
    it("works", function() {
      var env = Envelope.r(0.4);

      assert(env instanceof Envelope);
      assert.deepEqual(env.params, [
        [ 0, 1, 0 ], [ 0.4, 1e-4, 1 ], [ 0, 0, 0 ],
      ]);
    });
    it("works with totalLevel", function() {
      it("works", function() {
        var env = Envelope.r(0.4, 0.5);

        assert(env instanceof Envelope);
        assert.deepEqual(env.params, [
          [ 0, 0.5, 0 ], [ 0.4, 1e-4, 1 ], [ 0, 0, 0 ],
        ]);
      });
    });
  });
  describe(".cutoff(releaseTime: number, totalLevel: number = 1)", function() {
    it("works", function() {
      var env = Envelope.cutoff(0.4);

      assert(env instanceof Envelope);
      assert.deepEqual(env.params, [
        [ 0, 1, 0 ], [ 0.4, 0, 0 ],
      ]);
    });
    it("works with totalLevel", function() {
      it("works", function() {
        var env = Envelope.cutoff(0.4, 0.5);

        assert(env instanceof Envelope);
        assert.deepEqual(env.params, [
          [ 0, 0.5, 0 ], [ 0.4, 0, 0 ],
        ]);
      });
    });
  });
  describe("#params: [ number, number ][]", function() {
    it("works", function() {
      var params = [
        [ 0, 0, 0 ], [ 0.5, 0.5, 0 ], [ 1.0, 0.5, 0 ], [ 0.4, 0, 0 ],
      ];
      var env = new Envelope(params);

      assert(env.params !== params);
      assert.deepEqual(env.params, params);

      env.params[0][0] += 1;

      assert.deepEqual(env.params, params);
    });
  });
  describe("#duration: number", function() {
    it("works", function() {
      var env1 = Envelope.adssr(0.5, 0.2, 0.4, 1.0, 0.4);
      var env2 = Envelope.ads(0.5, 0.2, 0.4);

      assert(env1.duration === 2.1);
      assert(env2.duration === 0.7);
    });
  });
  describe("#valueAt(time: number): number", function() {
    it("works", function() {
      var env0 = new Envelope([]);
      var env1 = Envelope.adssr(0.5, 0.2, 0.4, 1.0, 0.4);

      assert(env0.valueAt(-10) === 0);
      assert(env0.valueAt(+10) === 0);

      assert(closeTo(env1.valueAt(-10), 0.0, 1e-6));
      // attack phase ( 0.0 -> 1.0 )
      assert(closeTo(env1.valueAt(0.0), 0.0, 1e-6));
      assert(closeTo(env1.valueAt(0.1), 0.2, 1e-6));
      assert(closeTo(env1.valueAt(0.2), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(0.3), 0.6, 1e-6));
      assert(closeTo(env1.valueAt(0.4), 0.8, 1e-6));
      assert(closeTo(env1.valueAt(0.5), 1.0, 1e-6));
      // decay phase ( 1.0 -> 0.4 )
      assert(closeTo(env1.valueAt(0.6), 0.632455, 1e-6));
      assert(closeTo(env1.valueAt(0.7), 0.4, 1e-6));
      // sustain phase ( 0.4 )
      assert(closeTo(env1.valueAt(0.8), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(0.9), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(1.0), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(1.1), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(1.2), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(1.3), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(1.4), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(1.5), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(1.6), 0.4, 1e-6));
      assert(closeTo(env1.valueAt(1.7), 0.4, 1e-6));
      // release phase (0.4 -> 0.0 )
      assert(closeTo(env1.valueAt(1.8), 0.050297, 1e-6));
      assert(closeTo(env1.valueAt(1.9), 0.006324, 1e-6));
      assert(closeTo(env1.valueAt(2.0), 0.000795, 1e-6));
      assert(closeTo(env1.valueAt(2.1), 0.0, 1e-6));
      assert(closeTo(env1.valueAt(2.2), 0.0, 1e-6));
      assert(closeTo(env1.valueAt(+10), 0.0, 1e-6));

      // re search
      assert(closeTo(env1.valueAt(0.5), 1.0, 1e-6));
    });
  });
  describe("#applyTo(audioParam: AudioParam, playbackTime: number): self", function() {
    it("works", function() {
      var env1 = Envelope.adssr(0.5, 0.2, 0.4, 1.0, 0.4);
      var audioParam = {
        setValueAtTime: sinon.spy(),
        linearRampToValueAtTime: sinon.spy(),
        exponentialRampToValueAtTime: sinon.spy(),
      };
      var env2 = env1.applyTo(audioParam, 10);

      assert(env2 === env1);
      assert(audioParam.setValueAtTime.callCount === 5);
      assert(audioParam.linearRampToValueAtTime.callCount === 2);
      assert(audioParam.exponentialRampToValueAtTime.callCount === 2);
      assert(audioParam.setValueAtTime.args[0][0] === 0);
      assert(audioParam.setValueAtTime.args[0][1] === 10);
      assert(audioParam.linearRampToValueAtTime.args[0][0] === 1);
      assert(audioParam.linearRampToValueAtTime.args[0][1] === 10 + 0.5);
      assert(audioParam.exponentialRampToValueAtTime.args[0][0] === 0.4);
      assert(audioParam.exponentialRampToValueAtTime.args[0][1] === 10 + 0.5 + 0.2);
      assert(audioParam.setValueAtTime.args[1][0] === 1);
      assert(audioParam.setValueAtTime.args[1][1] === 10 + 0.5);
      assert(audioParam.setValueAtTime.args[2][0] === 0.4);
      assert(audioParam.setValueAtTime.args[2][1] === 10 + 0.5 + 0.2 + 1.0);
      assert(audioParam.setValueAtTime.args[3][0] === 0.4);
      assert(audioParam.setValueAtTime.args[3][1] === 10 + 0.5 + 0.2 + 1.0);
      assert(audioParam.exponentialRampToValueAtTime.args[1][0] === 1e-4);
      assert(audioParam.exponentialRampToValueAtTime.args[1][1] === 10 + 0.5 + 0.2 + 1.0 + 0.4);
      assert(audioParam.setValueAtTime.args[4][0] === 1e-4);
      assert(audioParam.setValueAtTime.args[4][1] === 10 + 0.5 + 0.2 + 1.0 + 0.4);
      assert(audioParam.linearRampToValueAtTime.args[1][0] === 0);
      assert(audioParam.linearRampToValueAtTime.args[1][1] === 10 + 0.5 + 0.2 + 1.0 + 0.4 + 0.0001);
    });
    it("works with empty envelope", function() {
      var env1 = new Envelope([]);
      var audioParam = {
        setValueAtTime: sinon.spy(),
        linearRampToValueAtTime: sinon.spy(),
        exponentialRampToValueAtTime: sinon.spy(),
      };
      var env2 = env1.applyTo(audioParam, 0);

      assert(env2 === env1);
      assert(audioParam.setValueAtTime.callCount === 0);
      assert(audioParam.linearRampToValueAtTime.callCount === 0);
      assert(audioParam.exponentialRampToValueAtTime.callCount === 0);
    });
  });
  describe("#map(fn: function): Envelope", function() {
    it("works", function() {
      var env1 = Envelope.adssr(0.5, 0.2, 0.4, 1.0, 0.4);
      var env2 = env1.map(function(items) {
        return [ items[0] * 2, items[1] * 0.5 ];
      });

      assert(env2 instanceof Envelope);
      assert(env2.duration === env1.duration * 2);
      assert(env2.valueAt(0.0) === env1.valueAt(0.0) * 0.5);
      assert(env2.valueAt(0.2) === env1.valueAt(0.1) * 0.5);
      assert(env2.valueAt(0.4) === env1.valueAt(0.2) * 0.5);
      assert(env2.valueAt(0.6) === env1.valueAt(0.3) * 0.5);
      assert(env2.valueAt(0.8) === env1.valueAt(0.4) * 0.5);
      assert(env2.valueAt(1.0) === env1.valueAt(0.5) * 0.5);
      // assert(env2.valueAt(1.2) === env1.valueAt(0.6) * 0.5);
      // assert(env2.valueAt(1.4) === env1.valueAt(0.7) * 0.5);
      // assert(env2.valueAt(1.6) === env1.valueAt(0.8) * 0.5);
      // assert(env2.valueAt(1.8) === env1.valueAt(0.9) * 0.5);
      // assert(env2.valueAt(2.0) === env1.valueAt(1.0) * 0.5);
    });
  });
  describe("#madd(mul: number, add: number = 1): Envelope", function() {
    it("works", function() {
      var env1 = Envelope.adssr(0.5, 0.2, 0.4, 1.0, 0.4);
      var env2 = env1.madd(0.25, 0.5);

      assert(env2 instanceof Envelope);
      assert(env2.duration === env1.duration);
      assert(env2.valueAt(0.0) === env1.valueAt(0.0) * 0.25 + 0.5);
      assert(env2.valueAt(0.1) === env1.valueAt(0.1) * 0.25 + 0.5);
      assert(env2.valueAt(0.2) === env1.valueAt(0.2) * 0.25 + 0.5);
      assert(env2.valueAt(0.3) === env1.valueAt(0.3) * 0.25 + 0.5);
      assert(env2.valueAt(0.4) === env1.valueAt(0.4) * 0.25 + 0.5);
      assert(env2.valueAt(0.5) === env1.valueAt(0.5) * 0.25 + 0.5);
      // assert(env2.valueAt(0.6) === env1.valueAt(0.6) * 0.25 + 0.5);
      // assert(env2.valueAt(0.7) === env1.valueAt(0.7) * 0.25 + 0.5);
      // assert(env2.valueAt(0.8) === env1.valueAt(0.8) * 0.25 + 0.5);
      // assert(env2.valueAt(0.9) === env1.valueAt(0.9) * 0.25 + 0.5);
      // assert(env2.valueAt(1.0) === env1.valueAt(1.0) * 0.25 + 0.5);
    });
  });
});
