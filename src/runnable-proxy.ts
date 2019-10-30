import Redbird from 'redbird';

import { Runnable } from "./Runnable";
import { Writable } from 'stream';

export interface RunnableProxyConfiguration {
  host: string
  port: string

  ssl?: {
    port: string
    cert: string
    key: string
  }

  routes: { source: string, target: string }[]
}

export class RunnableProxy implements Runnable {

  config: RunnableProxyConfiguration;
  proxy: any

  constructor(config: RunnableProxyConfiguration) {
    this.config = config;
  }
  
  start(): void {
    if (this.proxy) {
      throw new Error('Proxy is already running.');
    }

    const { port, ssl, routes, host } = this.config;

    const stream = new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        // DO NOTHING FOR NOW...
      }
    })

    const bunyan = {
      name: 'foo',
      streams: [
        {
            level: 'info',
            type: 'raw',
            stream 
        }
      ]
    };

    this.proxy = new Redbird({ port, ssl, bunyan });

    routes.forEach(route => {
      this.proxy.register(`${host}${route.source}`, route.target, { ssl: true });
    });
  }
  
  stop(): void {
    if (!this.proxy) {
      throw new Error("Proxy is not running.");
    }

    this.proxy.close();
  }

}