import { __urlParams__ } from "./__urlParams__";

declare const APP_PASSWORD: string;
declare const APP_PACKAGE_NAME: string;
declare const APP_PACKAGE_VERSION: string;
declare const APP_BUILD_TIME: string;
declare const COMMIT_HASH: string;
declare const ENVIRONMENT: string;
declare const BLOCKCHAIN: string;

export const env = {
  APP_PASSWORD: APP_PASSWORD,
  APP_PACKAGE_NAME: APP_PACKAGE_NAME,
  APP_PACKAGE_VERSION: APP_PACKAGE_VERSION,
  APP_BUILD_TIME: APP_BUILD_TIME,
  COMMIT_HASH: COMMIT_HASH,
  ENVIRONMENT: ENVIRONMENT,
  BLOCKCHAIN: (__urlParams__.blockchain ?? BLOCKCHAIN) as "mainnet" | "testnet",
};

Object.assign(window, { env });
