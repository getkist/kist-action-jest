// ============================================================================
// Export
// ============================================================================

export { JestAction } from "./actions/JestAction/index.js";
export type { JestActionOptions } from "./actions/JestAction/index.js";
export { Action, ActionPlugin } from "./types/Action.js";
export type { ActionOptionsType } from "./types/Action.js";

// ============================================================================
// Plugin Definition
// ============================================================================

import { ActionPlugin } from "./types/Action.js";
import { JestAction } from "./actions/JestAction/index.js";

/**
 * kist plugin manifest for this package. Discovered and loaded by kist's
 * plugin resolver via the package's default export; `registerActions`
 * returns the map of action names to action classes that kist instantiates
 * one per pipeline step, so keys here must match the `action:` value used
 * in `kist.yml` (e.g. `action: JestAction`).
 */
const plugin: ActionPlugin = {
    name: "@getkist/action-jest",
    version: "1.0.29",
    description: "Jest test runner integration for kist",
    author: "kist",
    repository: "https://github.com/getkist/kist-action-jest",
    keywords: ["kist", "kist-action", "jest", "test"],
    registerActions() {
        return {
            JestAction,
        };
    },
};

export default plugin;
