# @session.js/mnemonic

Mnemonic/seed phrase utilities for Session messenger. Seed hex (and thus random mnemonic and random Session ID) can be generated using [@session.js/keypair](https://www.npmjs.com/package/@session.js/keypair).

## encode (seed hex -> phrase)

To encode mnemonic:

```ts
import { encode } from '@session.js/mnemonic'

encode('39038c8988db02c1af44e8c847bd9713') // => 'puffin luxury annoyed rustled memoir faxed smidgen puddle kiwi nylon utopia zinger kiwi'
```

## decode (phrase -> seed hex)

To decode mnemonic:

```ts
import { decode } from '@session.js/mnemonic'

decode('puffin luxury annoyed rustled memoir faxed smidgen puddle kiwi nylon utopia zinger kiwi') // => '39038c8988db02c1af44e8c847bd9713'
```

## Example: Generate random Session ID

Install [@session.js/keypair](https://www.npmjs.com/package/@session.js/keypair) to generate random seed hex.

> Hint: Session IDs are [x25519 aka Curve25519](https://en.wikipedia.org/wiki/Curve25519) public keys prepended with `05`

```ts
import { generateSeedHex, getKeypairFromSeed } from '@session.js/keypair'
import { encode } from '@session.js/mnemonic'

const seedHex = generateSeedHex()
const keypair = getKeypairFromSeed(seedHex)
const mnemonic = encode(seedHex)
const sessionID = keypair.x25519.publicKey

console.log('Generated session ID:', sessionID)
console.log('Mnemonic for it:', mnemonic)
```

## Dictionaries

By default, this package comes only with english dictionary. You can add your own mnemonic languages:

```ts
import { decode, mnemonicLanguages, addMnemonicLanguage } from '@session.js/mnemonic'

mnemonicLanguages.russian = addMnemonicLanguage({
  prefixLen: 3,
  words: [/* ... */]
})
decode('любовь любовь любовь любовь любовь любовь любовь любовь любовь любовь любовь любовь любовь', 'russian')
```

## Made for session.js

Use Session messenger programmatically with [Session.js](https://github.com/sessionjs/client): Session bots, custom Session clients, and more.

## Donate

[hloth.dev/donate](https://hloth.dev/donate)