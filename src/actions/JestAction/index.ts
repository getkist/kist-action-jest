/**
 * Public entry point for the JestAction module. Re-exports the action class
 * and its options type so consumers can import both from a single path
 * (`./actions/JestAction`) without reaching into `JestAction.js` directly.
 */
export { JestAction } from "./JestAction.js";
export type { JestActionOptions } from "./JestAction.js";
