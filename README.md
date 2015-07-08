# ENVELOPE

> simple envelope

## Installation

Node.js

```sh
npm install @mohayonao/envelope
```

## API
### Envelope
- `constructor(params: number[][])`

### Class methods
- `adsr(attackTime: number, decayTime: number, sustainLevel: number, sustainTime: number, releaseTime: number): Envelope`
- `ads(attackTime: number, decayTime: number, sustainLevel: number): Envelope`

### Instance attribute
- `duration: number`

### Instance methods
- `valueAt(time: number): number`
- `apply(audioParam: AudioParam, playbackTime: number): void`

## License
MIT
