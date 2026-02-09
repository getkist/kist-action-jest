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

const plugin: ActionPlugin = {
    name: "@getkist/action-jest",
    version: "1.0.0",
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
