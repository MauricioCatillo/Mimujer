declare module 'cors' {
  import { RequestHandler } from 'express';

  type StaticOrigin = boolean | string | RegExp | (string | RegExp)[];
  type CustomOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: StaticOrigin) => void) => void;

  interface CorsOptions {
    origin?: StaticOrigin | CustomOrigin;
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  type CorsRequestHandler = RequestHandler;

  function cors(options?: CorsOptions): CorsRequestHandler;

  export { CorsOptions, CorsRequestHandler };
  export default cors;
}
