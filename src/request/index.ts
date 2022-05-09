import axios, { AxiosRequestConfig } from 'axios';
import { inject } from 'regexparam';

enum Method {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export interface Payload extends AxiosRequestConfig {
  query?: Object;
}

export class ExtendedPromise<T> extends Promise<T> {
  #abortController: AbortController;

  constructor(cb: any, options: any) {
    super(cb);
    this.#abortController = options?.abortController;
  }

  abort() {
    // console.log(this.#abortController.abort);
    return this.#abortController?.abort?.();
  }
}

const lead = (x: string) => (x.charCodeAt(0) === 47 ? x : '/' + x); // prepend "/" in uri

const configMap = new WeakMap();

export class Requests {
  options: any;
  #target: any;
  #requests: any = new Map();

  constructor(target: any, options: any) {
    this.#target = target;
    this.options = options;

    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
  }

  public get(payload: Payload) {
    return this.#create(Method.GET, payload);
  }

  public post(payload: Payload) {
    return this.#create(Method.POST, payload);
  }

  public put(payload: Payload) {
    return this.#create(Method.PUT, payload);
  }

  public patch(payload: Payload) {
    return this.#create(Method.PATCH, payload);
  }

  public delete(payload: Payload) {
    return this.#create(Method.DELETE, payload);
  }

  #create(method: Method, _payload: any) {
    const httpConfig = configMap.get(this.#target.constructor);

    const { params, query, ...payload } = Object.assign(httpConfig, this.options, _payload);

    // Axios doesnt support path params, which confuse between query and params
    payload.url = lead(inject(payload?.url, params)); // user/:id => user/abc

    payload.params = query;

    payload.method = method;

    const keyId = JSON.stringify(payload); // turn payload into id

    const abortController = new AbortController();

    payload.signal = abortController.signal;

    if (this.#requests.get(keyId) == null) {
      this.#requests.set(keyId, { abortController, resolvers: [] });
    }

    const request = this.#requests.get(keyId);

    function handleError(e: Error) {
      for (const { reject } of request.resolvers) {
        reject(e);
      }

      request.resolvers = [];
    }

    function handlerComplete(data: any) {
      for (const { resolve } of request.resolvers) {
        resolve(data);
      }

      request.resolvers = [];
    }

    return new ExtendedPromise<any>(
      (resolve: Function, reject: Function) => {
        request.resolvers.push({ resolve, reject });

        if (request.resolvers.length == 1) {
          axios.request(payload).then(handlerComplete).catch(handleError);
        }
      },
      { abortController },
    );
  }
}

export function Http(config: any) {
  return (Target: any): any => {
    config.timeout = config.timeout || 1500;
    configMap.set(Target, config);
  };
}

// This code does not work on esnext build in tsconfig (probably a bug on this target build)
export function Request(options: AxiosRequestConfig, cb?: Function) {
  return (target: any, key: string) => {
    const privatePropKey = Symbol(key);

    Reflect.defineProperty(target, key, {
      get(this: any) {
        return this[privatePropKey];
      },
      set(this: any, newValue: any) {
        this[privatePropKey] = newValue;
      },
    });

    if (target[key] == null) {
      target[key] = new Requests(target, options);
    }
  };
}
