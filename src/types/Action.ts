// ============================================================================
// Classes
// ============================================================================

/**
 * Base class every kist action implementation extends. Defines the contract
 * kist's pipeline runner relies on (a name, a description, option
 * validation, and execution) plus a small set of prefixed logging helpers so
 * output from different actions in the same pipeline run is distinguishable.
 *
 * `TOptions` should be a plain, JSON-serializable options interface (as
 * loaded from `kist.yml`) — see `JestActionOptions` in
 * `@getkist/action-jest` for an example implementation.
 */
export abstract class Action<TOptions = Record<string, unknown>> {
    /**
     * The unique name of this action, matched against the `action:` field in
     * `kist.yml` pipeline steps to select which action implementation runs.
     * Subclasses must assign a literal, stable value (renaming it breaks any
     * pipeline still referencing the old name).
     */
    abstract readonly name: string;

    /**
     * Returns a human-readable, one-line description of what this action
     * does, surfaced in pipeline logs, generated documentation, and any
     * `kist` CLI help/listing output.
     *
     * @returns A short description string. Should not include newlines.
     */
    abstract describe(): string;

    /**
     * Validates the provided options before {@link execute} runs, allowing
     * invalid configuration (out-of-range values, mutually exclusive flags,
     * etc.) to be reported clearly instead of failing deep inside a spawned
     * process or third-party tool. Implementations should call
     * {@link logError} to explain *why* validation failed before returning
     * `false`, since the caller only receives a boolean.
     *
     * @param options - The options to validate.
     * @returns `true` if options are valid, `false` otherwise.
     */
    abstract validateOptions(options: TOptions): boolean;

    /**
     * Executes the action with the provided options. Implementations are
     * expected to call {@link validateOptions} first and throw if it returns
     * `false`, so callers can rely on `execute` alone to enforce valid
     * configuration.
     *
     * @param options - The options for this action.
     * @returns A promise that resolves when the action completes
     * successfully.
     * @throws {Error} If `options` are invalid, or if the underlying work
     * (e.g. a spawned process or external tool) fails.
     */
    abstract execute(options: TOptions): Promise<void>;

    /**
     * Logs an informational message, prefixed with this action's `name` so
     * it's attributable in pipeline output that interleaves multiple
     * actions.
     *
     * @param message - The message to log.
     */
    protected logInfo(message: string): void {
        console.log(`[${this.name}] ${message}`);
    }

    /**
     * Logs a warning message for a condition that isn't fatal but the user
     * likely wants to know about (e.g. a deprecated option was used).
     *
     * @param message - The message to log.
     */
    protected logWarning(message: string): void {
        console.warn(`[${this.name}] WARNING: ${message}`);
    }

    /**
     * Logs an error message, typically just before throwing or returning a
     * failure from {@link validateOptions} or {@link execute}.
     *
     * @param message - The message to log.
     * @param error - Optional underlying error or rejection value to log
     * alongside the message, for additional context (e.g. a caught
     * exception from a spawned process).
     */
    protected logError(message: string, error?: unknown): void {
        console.error(`[${this.name}] ERROR: ${message}`, error || "");
    }

    /**
     * Logs a debug message, but only when the `DEBUG` environment variable
     * is set (to any truthy string) — intended for verbose diagnostic
     * output (e.g. the exact command line of a spawned process) that would
     * be noise in normal pipeline runs.
     *
     * @param message - The message to log.
     */
    protected logDebug(message: string): void {
        if (process.env.DEBUG) {
            console.debug(`[${this.name}] DEBUG: ${message}`);
        }
    }
}

// ============================================================================
// Types
// ============================================================================

/**
 * Generic shape for an action's options before they've been validated
 * against a specific action's own options interface. Used as the default
 * for {@link Action}'s `TOptions` type parameter and wherever options need
 * to be handled without knowledge of a concrete action's option shape (e.g.
 * generic pipeline/config loading code).
 */
export type ActionOptionsType = Record<string, unknown>;

/**
 * Manifest shape a kist action package's default export must satisfy so
 * kist's plugin loader can discover and register the actions it provides.
 * Metadata fields (`name`, `description`, `author`, etc.) are surfaced in
 * `kist` CLI tooling and documentation; only `version` and one of
 * `actions`/`registerActions` are required for a plugin to actually load.
 */
export interface ActionPlugin {
    /** Plugin package name (default: none — recommended to match the npm package name, e.g. `@getkist/action-jest`) */
    name?: string;
    /** Plugin version, typically kept in sync with the package's own `package.json` version */
    version: string;
    /** Short human-readable description of what the plugin provides */
    description?: string;
    /** Plugin author name or organization */
    author?: string;
    /** URL of the plugin's source repository */
    repository?: string;
    /** Search/discovery keywords for the plugin */
    keywords?: string[];
    /**
     * Static map of action names to action classes. Prefer
     * `registerActions` for anything requiring setup logic; when both are
     * present, kist's loader treats `registerActions` as authoritative.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actions?: Record<string, new () => Action<any>>;
    /**
     * Factory function returning the map of action names to action classes
     * this plugin registers. Preferred over the static `actions` field when
     * the set of actions needs to be computed rather than declared inline.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerActions?: () => Record<string, new () => Action<any>>;
}
