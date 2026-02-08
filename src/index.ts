import { JestAction } from "./actions/JestAction/index.js";

export { JestAction } from "./actions/JestAction/index.js";
export type { JestActionOptions } from "./actions/JestAction/index.js";
export { Action } from "./types/Action.js";

/**
 * Plugin definition for kist
 */
export default {
    name: "@getkist/action-jest",
    version: "1.0.0",
    actions: {
        JestAction: new JestAction(),
    },
};
