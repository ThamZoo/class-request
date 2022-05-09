import { Http, Request, Requests } from '../src/request';

@Http({ baseURL: 'https://reqres.in/' })
export class TestRepo {
  @Request({ url: 'api/:page' })
  public stock!: Requests;
}

const a = new TestRepo();

console.log(a);
