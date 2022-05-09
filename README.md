## Request Model

This library simplify restful call for both front-end/backend application!

Features including

1. Declarative style - write once use anywhere
2. Support Batching api call
3. Support abort request,
4. Support dynamic uri at runtime - regrex :param url in request
5. Modern class based Decorator style declaration
6. Work on frontend and backend
7. Todo -- Set Headers

### Example 1

```javascript

import { Request, Http, Requests } from "class-request";

// Declare Repository
@Http({ baseURL: "https://reqres.in/", timeout: 3000 })
class SampleRepository {
  @Request({ url: "api/:page" })
  public stock!: Requests;
}

// usage

const result = new SampleRepository();

// support headers, params | query | data - for body

result.stock.get({ params: { page: 'sample' }}).then((e: any) => console.log(e.status));

result.stock.post({ params: { page: 'sample' }}).then((e: any) => console.log(e.status));

result.stock.put({ params: { page: 'sample' }}).then((e: any) => console.log(e.status));

result.stock.patch({ params: { page: 'sample' }}).then((e: any) => console.log(e.status));
```

### Example 2

- Abort a request

```javascript
  // abort
  const req = result.stock.get(payload: any)
  req.abort()

```

### Example 3

- Allow custom repository method

```javascript

  import { Request, Http, Requests } from "class-request";

  @Http({ baseURL: "https://reqres.in/" })
  export class PortfolioReposistory {
    @Request({ url: "api/:page" })
    public stock!: Requests;

    @Request({ url: "api/:page" })
    public account!: Requests;

    getStockAndAccount(stockPayload: Object, accountPayload: Object) {
      return Promise.all([
        this.stock.get(stockPayload),
        this.account.post(accountPayload),
      ]);
    }

    async getAndTransform(stockPayload: any) {
      const data = await this.stock.get(stockPayload);

      return data?.filter(x => x.age > 20)
    }
  }

```
