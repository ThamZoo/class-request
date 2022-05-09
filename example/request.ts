import { Request, Http, Requests, Payload, ExtendedPromise } from '../src/request';

const headers: any = {};

@Http({ baseURL: 'https://reqres.in/', headers })
export class TestRepo {
  @Request({ url: 'api/:page/:id?' })
  public stock!: Requests;

  @Request({ url: 'api/:page' })
  public account!: Requests;

  getStockAndAccount(stockPayload: Payload, accountPayload: Payload) {
    return Promise.all([this.stock.get(stockPayload), this.account.get(accountPayload)]);
  }
}

headers.authentication = 'hash';
const test = new TestRepo();

const a: ExtendedPromise<any> = test.stock.get({ params: { page: 'users' } });
const b: ExtendedPromise<any> = test.stock.get({ params: { page: 'users', id: 1 } });

try {
  a.then((e) => console.log(e));
  a.abort();
} catch (e) {
  console.log(e);
}
