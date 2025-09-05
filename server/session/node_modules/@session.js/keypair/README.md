# @session.js/keypair

Session messenger & Session.js keypairs utilities.

## type Keypair

Keypair is a pair of two Sodium's KeyPairs: x25519 (curve25519) and ed25519

```ts
type Keypair = {
  x25519: sodium.KeyPair
  ed25519: sodium.KeyPair
}
```

Session ID consists of x25519's public key prepended with `05`.

Ed25519 keypairs are used mainly for messages encryption.

## getKeypairFromSeed

Converts seed hex to Keypair:

```ts
import { getKeypairFromSeed } from '@session.js/keypair'

const keypairs = getKeypairFromSeed('39038c8988db02c1af44e8c847bd9713')
console.log(keypairs.x25519.publicKey) // => 0548054830367d369d94605247999a375dbd0a0f65fdec5de1535612bcb6d4de452c69
```

## generateSeedHex

Generates random seed and converts it to hex. Under the hood it uses sodium.randombytes_buf.

```ts
import { generateSeedHex } from '@session.js/keypair'

const seed = await generateSeedHex()
console.log(seed) // => 39038c8988db02c1af44e8c847bd9713
```

## Made for session.js

Use Session messenger programmatically with [Session.js](https://github.com/sessionjs/client): Session bots, custom Session clients, and more.

## Donate

[hloth.dev/donate](https://hloth.dev/donate)