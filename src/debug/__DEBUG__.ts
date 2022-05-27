export const __DEBUG__ = location.search.indexOf("debug") !== -1 && !location.hostname.includes("trains.cards");
export const __MOCK__ = location.search.indexOf("mock") !== -1 && !location.hostname.includes("trains.cards");

//// //// //// //// //// //// //// //// //// //// //// //// ////
//// //// //// //// //// //// //// //// //// //// //// //// ////
//// //// //// //// //// //// //// //// //// //// //// //// ////

import "@debug/__";
import { __window__ } from "@debug/__";
import { __urlParams__ } from "@game/app/__urlParams__";