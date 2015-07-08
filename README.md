# ENVELOPE

> simple envelope

## Installation

Node.js

```sh
npm install @mohayonao/envelope
```

## API
### Envelope
- `constructor(params: [ time: number, value: number ][])`

### Class methods
- `adssr(attackTime: number, decayTime: number, sustainLevel: number, sustainTime: number, releaseTime: number): Envelope`
- `ads(attackTime: number, decayTime: number, sustainLevel: number): Envelope`

### Instance attribute
- `params: [ number, number ][]`
- `duration: number`

### Instance methods
- `valueAt(time: number): number`
- `applyTo(audioParam: AudioParam, playbackTime: number): self`
- `map(fn: function): Envelope`

## License
MIT
