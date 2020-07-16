You can extend [@ng-apimock/core](https://github.com/ng-apimock/core) by creating your own plugin.
In order to do so you need to implement a client based on [@ng-apimock/base-client](https://github.com/ng-apimock/base-client)

## Requirements

see Ng-apimock [requirements](/docs/#requirements)

## Dependencies using npm / yarn
In order to create a custom plugin, you need to extend the [@ng-apimock/base-client](https://github.com/ng-apimock/base-client).
Add the dependency to you project.

```bash
npm install @ng-apimock/base-client --save
```
or 

```bash
yarn add @ng-apimock/base-client
```

## Create your own plugin
Once the dependency has been installed, you can start by implementing the plugin.

```typescript
import { BaseClient } from '@ng-apimock/base-client';

export class MyCustomClient extends BaseClient {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    /** {@inheritDoc}. */
    async openUrl(url: string): Promise<any> {
        // TODO implement how the http call to the given url will be processed
    }

    /** {@inheritDoc}. */
    async setCookie(name: string, value: string): Promise<any> {
        // TODO implement how the http cookie will be set  
    }
}
```

## API 
See [API](/docs/api/select-scenario)
