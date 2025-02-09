/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin_characters from "../admin/characters.js";
import type * as auth from "../auth.js";
import type * as db from "../db.js";
import type * as http from "../http.js";
import type * as public_auth from "../public/auth.js";
import type * as public_characters from "../public/characters.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "admin/characters": typeof admin_characters;
  auth: typeof auth;
  db: typeof db;
  http: typeof http;
  "public/auth": typeof public_auth;
  "public/characters": typeof public_characters;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
