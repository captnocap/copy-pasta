# @session.js/types

A special package that holds TypeScript definitions and enums shared internally for developing your own @session.js/client modular parts.

To build your own Storage adapter, use:

```ts
import type { Storage } from '@session.js/types'

export class MyInMemoryStorage implements Storage {
  storage: Map<string, string> = new Map()

  get(key: string) {
    return this.storage.get(key) ?? null
  }

  set(key: string, value: string) {
    this.storage.set(key, value)
  }

  delete(key: string) {
    this.storage.delete(key)
  }

  has(key: string) {
    return this.storage.has(key)
  }
}
```

To build your own Network connecter, use:

```ts
import type { Network } from '@session.js/types'
import { 
  RequestType, 
  type RequestGetSwarmsBody, 
  type RequestPollBody, 
  type RequestStoreBody, 
  type RequestUploadAttachment 
} from '@session.js/types/network/request'

export class MyNetwork implements Network {
  onRequest(type: RequestType, body: object): Promise<object> {
    switch(type) {
      case RequestType.Store:
        return // typeof ResponseStore

      case RequestType.GetSnodes:
        return // typeof ResponseGetSnodes

      case RequestType.GetSwarms:
        return // typeof ResponseGetSwarms

      case RequestType.Poll:
        return // typeof ResponsePoll

      case RequestType.UploadAttachment:
        return // typeof ResponseUploadAttachment

      default:
        throw new Error('Invalid request type')
    }
  }
}
```

## Made for session.js

Use Session messenger programmatically with [Session.js](https://github.com/sessionjs/client): Session bots, custom Session clients, and more.

## Donate

[hloth.dev/donate](https://hloth.dev/donate)