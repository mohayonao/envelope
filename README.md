# ENVELOPE
[![Build Status](http://img.shields.io/travis/mohayonao/envelope.svg?style=flat-square)](https://travis-ci.org/mohayonao/envelope)
[![NPM Version](http://img.shields.io/npm/v/@mohayonao/envelope.svg?style=flat-square)](https://www.npmjs.org/package/@mohayonao/envelope)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

> simple envelope

## Installation

Node.js

```sh
npm install @mohayonao/envelope
```

Browser

- [envelope.js](https://raw.githubusercontent.com/mohayonao/envelope/master/build/envelope.js)

## API
### Envelope
- `constructor(params: [ time: number, value: number, curve: number ][])`

### Class methods
- `adssr(attackTime, decayTime, sustainLevel, sustainTime, releaseTime, [ totalLevel = 1 ]): Envelope`
- `ads(attackTime, decayTime, sustainLevel, [ totalLevel = 1 ]): Envelope`
- `asr(attackTime, sustainTime, releaseTime, [ totalLevel = 1 ]): Envelope`
- `a(attackTime, [ totalLevel = 1 ]): Envelope`
- `dssr(decayTime, sustainLevel, sustainTime, releaseTime, [ totalLevel = 1 ]): Envelope`
- `ds(decayTime, sustainLevel, [ totalLevel = 1 ]): Envelope`
- `r(releaseTime, [ totalLevel = 1 ]): Envelope`
- `cutoff(releaseTime, [ totalLevel = 1 ]): Envelope`

### Instance attribute
- `params: [ number, number, number ][]`
- `duration: number`

### Instance methods
- `valueAt(time: number): number`
- `applyTo(audioParam: AudioParam, playbackTime: number): self`
- `map(fn: function): Envelope`
- `madd(mul: number, add: number = 1): Envelope`

## License
MIT
