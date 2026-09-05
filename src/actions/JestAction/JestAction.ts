import { Action } from "../../types/Action.js";
import { spawn } from "child_process";
import { createRequire } from "module";

/**
 * This package is ESM, where the bare `require` this used to call does not
 * exist — resolving Jest's binary threw a ReferenceError on every run. kist
 * loads plugins with `await import()`, so that is the path every pipeline
 * takes. `createRequire` gives back a resolver bound to this module.
 */
const requireFrom = createRequire(import.meta.url);

/**
 * Configuration options for {@link JestAction}. These map closely to Jest's
 * own CLI flags — most options are passed straight through to `jest` via
 * {@link JestAction.buildArgs} and are omitted entirely (letting Jest fall
 * back to its own defaults) when left `undefined`.
 *
 * @example
 * ```yaml
 * pipeline:
 *     stages:
 *         - name: test
 *           steps:
 *               - name: unit-tests
 *                 action: JestAction
 *                 options:
 *                     configPath: ./jest.config.js
 *                     testPathPattern: "src/**\/*.test.ts"
 *                     coverage: true
 *                     coverageReporters:
 *                         - text
 *                         - lcov
 *                     coverageThresholdLines: 80
 *                     coverageThresholdBranches: 70
 *                     runInBand: true
 *                     bail: 1
 * ```
 */
export interface JestActionOptions {
    /**
     * Path to a Jest config file (passed as `--config`). When omitted, Jest
     * resolves its own config using its standard discovery rules.
     */
    configPath?: string;

    /**
     * Glob patterns used by Jest to discover test files. When omitted, Jest's
     * built-in `testMatch` defaults apply.
     */
    testMatch?: string[];

    /**
     * Regex pattern matched against test file paths; only matching files are
     * run (passed as `--testPathPattern`). Unlike `testMatch`, this is a
     * single regex string, not a glob list.
     */
    testPathPattern?: string;

    /**
     * Run Jest in watch mode, re-running tests related to changed files
     * (default: false). Intended for local/interactive use — combining this
     * with an automated pipeline run will block the pipeline indefinitely
     * since Jest never exits.
     */
    watch?: boolean;

    /**
     * Like `watch`, but re-runs the entire suite on every change instead of
     * only tests related to changed files (default: false). Has the same
     * "never exits" caveat as `watch`.
     */
    watchAll?: boolean;

    /**
     * Collect and report code coverage (default: false). Required for the
     * `coverageReporters` and `coverageThreshold*` options to have any
     * effect.
     */
    coverage?: boolean;

    /**
     * Coverage reporters to use (e.g. `text`, `lcov`, `html`). Only applied
     * when `coverage` is true; falls back to Jest's default reporters when
     * omitted.
     */
    coverageReporters?: string[];

    /**
     * Minimum required branch coverage percentage (0-100). Enforced only
     * when `coverage` is true; Jest fails the run if actual coverage falls
     * below this value.
     */
    coverageThresholdBranches?: number;

    /**
     * Minimum required function coverage percentage (0-100). Enforced only
     * when `coverage` is true; Jest fails the run if actual coverage falls
     * below this value.
     */
    coverageThresholdFunctions?: number;

    /**
     * Minimum required line coverage percentage (0-100). Enforced only when
     * `coverage` is true; Jest fails the run if actual coverage falls below
     * this value.
     */
    coverageThresholdLines?: number;

    /**
     * Minimum required statement coverage percentage (0-100). Enforced only
     * when `coverage` is true; Jest fails the run if actual coverage falls
     * below this value.
     */
    coverageThresholdStatements?: number;

    /**
     * Run all tests serially in the current process instead of spawning a
     * worker pool (default: false). Useful for debugging or environments
     * where parallel workers are unreliable (e.g. constrained CI runners).
     */
    runInBand?: boolean;

    /**
     * Maximum number of worker processes Jest may use for parallel test
     * runs. Accepts an absolute count or a percentage string (e.g. `"50%"`).
     * When omitted, Jest chooses based on available CPU cores.
     */
    maxWorkers?: number | string;

    /**
     * Only run tests related to files changed since the last commit
     * (default: false). Requires the project to be a git or Mercurial
     * repository.
     */
    onlyChanged?: boolean;

    /**
     * Stop running tests after the first failure. Pass `true` to bail after
     * one failing test suite, or a number to bail after that many failing
     * suites (default: false, i.e. run to completion).
     */
    bail?: boolean | number;

    /**
     * Rewrite failing snapshots to match the current output instead of
     * failing the test (default: false). Intended for local development;
     * avoid enabling this in CI pipelines as it silently accepts snapshot
     * changes.
     */
    updateSnapshot?: boolean;

    /**
     * Automatically clear mock calls, instances, contexts, and results
     * before every test (default: false).
     */
    clearMocks?: boolean;

    /**
     * Automatically reset mock state before every test, in addition to what
     * `clearMocks` does (default: false).
     */
    resetMocks?: boolean;

    /**
     * Print individual test results with the full suite hierarchy as tests
     * run (default: false).
     */
    verbose?: boolean;

    /**
     * Prevent tests from printing messages through the console (default:
     * false). Console output is buffered and only attached to the test
     * report for failing tests.
     */
    silent?: boolean;

    /**
     * Do not fail the run when no test files are found (default: false).
     * Useful for pipeline steps that run across many packages where some may
     * have no tests yet.
     */
    passWithNoTests?: boolean;

    /**
     * Print open handles preventing Jest from exiting cleanly after the run
     * completes (default: false). Useful for diagnosing hangs caused by
     * timers, sockets, or other unclosed resources.
     */
    detectOpenHandles?: boolean;

    /**
     * Force Jest's process to exit once tests complete, even if resources
     * remain open (default: false). Masks the underlying cause of hangs, so
     * prefer fixing the leak (see `detectOpenHandles`) over relying on this.
     */
    forceExit?: boolean;

    /**
     * Only run tests whose full name (describe + it) matches this regex
     * pattern (passed as `--testNamePattern`).
     */
    testNamePattern?: string;

    /**
     * Working directory Jest is spawned from (default: `process.cwd()`).
     * Relative paths in other options, such as `configPath`, are resolved
     * against this directory.
     */
    cwd?: string;

    /**
     * Additional value for the `NODE_OPTIONS` environment variable passed to
     * the spawned Jest process (e.g. `--experimental-vm-modules`). Overrides
     * any `NODE_OPTIONS` inherited from the parent process.
     */
    nodeOptions?: string;

    /**
     * Extra environment variables to set on the spawned Jest process, merged
     * on top of the current process's environment.
     */
    env?: Record<string, string>;
}

/**
 * kist action that runs a project's test suite with Jest by spawning Jest's
 * CLI binary as a child process. Options are translated into the equivalent
 * Jest CLI flags (see {@link buildArgs}), so behavior for any given option
 * mirrors Jest's own semantics rather than reimplementing them.
 */
export class JestAction extends Action<JestActionOptions> {
    /**
     * The name this action is registered and referenced by. A step's
     * `action: JestAction` in kist.yaml resolves through this value, and it
     * also prefixes the action's log output.
     */
    readonly name = "JestAction";

    /**
     * Returns a short, human-readable summary of this action, used in pipeline
     * logs and documentation.
     *
     * @returns A one-line description of what this action does.
     */
    describe(): string {
        return "Run tests using Jest test framework";
    }

    /**
     * Validates option values that Jest would otherwise reject at runtime
     * with a less helpful error, so problems can be caught and reported
     * before a process is spawned. Options not covered here (e.g. path
     * strings) are left for Jest itself to validate.
     *
     * @param options - The options supplied to {@link execute}.
     * @returns `true` if all validated options are within acceptable ranges;
     * `false` if any check fails (the specific failure is logged via
     * {@link Action.logError} before returning).
     */
    validateOptions(options: JestActionOptions): boolean {
        if (options.maxWorkers !== undefined) {
            if (typeof options.maxWorkers === "number" && options.maxWorkers < 1) {
                this.logError("Invalid options: 'maxWorkers' must be at least 1");
                return false;
            }
            if (typeof options.maxWorkers === "string" && !/^\d+%?$/.test(options.maxWorkers)) {
                this.logError("Invalid options: 'maxWorkers' must be a number or percentage string (e.g., '50%')");
                return false;
            }
        }

        if (options.bail !== undefined) {
            if (typeof options.bail === "number" && options.bail < 0) {
                this.logError("Invalid options: 'bail' must be a non-negative number");
                return false;
            }
        }

        const thresholds = [
            options.coverageThresholdBranches,
            options.coverageThresholdFunctions,
            options.coverageThresholdLines,
            options.coverageThresholdStatements,
        ];

        for (const threshold of thresholds) {
            if (threshold !== undefined && (threshold < 0 || threshold > 100)) {
                this.logError("Invalid options: coverage thresholds must be between 0 and 100");
                return false;
            }
        }

        return true;
    }

    /**
     * Runs Jest with the given options: validates them, translates them into
     * CLI arguments, and spawns Jest as a child process, streaming its
     * output directly to this process's stdio.
     *
     * @param options - The options for this test run.
     * @returns A promise that resolves once Jest exits with status code 0.
     * @throws {Error} If `options` fail {@link validateOptions}, or if the
     * spawned Jest process exits with a non-zero status code or errors
     * (e.g. the `jest` binary cannot be resolved or spawned).
     */
    async execute(options: JestActionOptions): Promise<void> {
        if (!this.validateOptions(options)) {
            throw new Error("Invalid options provided to JestAction");
        }

        const args = this.buildArgs(options);
        const cwd = options.cwd || process.cwd();

        this.logInfo(`Running Jest tests${options.configPath ? ` with config: ${options.configPath}` : ""}`);

        try {
            await this.runJest(args, cwd, options.nodeOptions, options.env);
            this.logInfo("Tests completed successfully");
        } catch (error) {
            this.logError("Jest tests failed.", error);
            throw error;
        }
    }

    /**
     * Translates {@link JestActionOptions} into the equivalent Jest CLI
     * argument list. Options that are `undefined` or `false` are omitted
     * entirely rather than passed as explicit negatives, so Jest's own
     * defaults apply unless a value was explicitly provided. Coverage
     * threshold options are collected and emitted together as a single
     * `--coverageThreshold` JSON argument (Jest's expected format), rather
     * than as individual flags.
     *
     * @param options - The options to translate.
     * @returns The ordered list of CLI arguments to pass to the Jest binary.
     */
    private buildArgs(options: JestActionOptions): string[] {
        const args: string[] = [];

        if (options.configPath) {
            args.push("--config", options.configPath);
        }

        // `testMatch` is a repeatable array flag, like `--coverageReporters`
        // below. It was declared as an option and documented as taking
        // effect, but never reached the CLI at all — so setting it silently
        // ran Jest's default discovery instead.
        if (options.testMatch && options.testMatch.length > 0) {
            for (const pattern of options.testMatch) {
                args.push("--testMatch", pattern);
            }
        }

        if (options.testPathPattern) {
            args.push("--testPathPattern", options.testPathPattern);
        }

        if (options.testNamePattern) {
            args.push("--testNamePattern", options.testNamePattern);
        }

        if (options.watch) {
            args.push("--watch");
        }

        if (options.watchAll) {
            args.push("--watchAll");
        }

        if (options.coverage) {
            args.push("--coverage");
        }

        if (options.coverageReporters && options.coverageReporters.length > 0) {
            for (const reporter of options.coverageReporters) {
                args.push("--coverageReporters", reporter);
            }
        }

        if (options.runInBand) {
            args.push("--runInBand");
        }

        if (options.maxWorkers !== undefined) {
            args.push("--maxWorkers", String(options.maxWorkers));
        }

        if (options.onlyChanged) {
            args.push("--onlyChanged");
        }

        if (options.bail !== undefined) {
            if (typeof options.bail === "boolean") {
                if (options.bail) args.push("--bail");
            } else {
                args.push("--bail", String(options.bail));
            }
        }

        if (options.updateSnapshot) {
            args.push("--updateSnapshot");
        }

        if (options.clearMocks) {
            args.push("--clearMocks");
        }

        if (options.resetMocks) {
            args.push("--resetMocks");
        }

        if (options.verbose) {
            args.push("--verbose");
        }

        if (options.silent) {
            args.push("--silent");
        }

        if (options.passWithNoTests) {
            args.push("--passWithNoTests");
        }

        if (options.detectOpenHandles) {
            args.push("--detectOpenHandles");
        }

        if (options.forceExit) {
            args.push("--forceExit");
        }

        // Handle coverage thresholds
        const hasThresholds = [
            options.coverageThresholdBranches,
            options.coverageThresholdFunctions,
            options.coverageThresholdLines,
            options.coverageThresholdStatements,
        ].some(t => t !== undefined);

        if (hasThresholds) {
            const thresholds: Record<string, number> = {};
            if (options.coverageThresholdBranches !== undefined) {
                thresholds.branches = options.coverageThresholdBranches;
            }
            if (options.coverageThresholdFunctions !== undefined) {
                thresholds.functions = options.coverageThresholdFunctions;
            }
            if (options.coverageThresholdLines !== undefined) {
                thresholds.lines = options.coverageThresholdLines;
            }
            if (options.coverageThresholdStatements !== undefined) {
                thresholds.statements = options.coverageThresholdStatements;
            }
            args.push("--coverageThreshold", JSON.stringify({ global: thresholds }));
        }

        return args;
    }

    /**
     * Spawns Jest's CLI binary (`jest/bin/jest.js`) as a child process via
     * `node`, resolved through Node's own module resolution so it works
     * regardless of how this package is installed relative to Jest. Output
     * is inherited directly to this process's stdio rather than captured,
     * so test output streams live rather than being buffered.
     *
     * @param args - CLI arguments to pass to Jest (see {@link buildArgs}).
     * @param cwd - Working directory to spawn the Jest process in.
     * @param nodeOptions - When provided, sets `NODE_OPTIONS` on the spawned
     * process's environment, overriding any inherited value.
     * @param env - Extra environment variables merged on top of the current
     * process's environment for the spawned process.
     * @returns A promise that resolves when Jest exits with status code 0.
     * @throws {Error} If Jest exits with a non-zero status code, or if the
     * child process itself fails to spawn (e.g. `node` is not found).
     */
    private runJest(
        args: string[], 
        cwd: string, 
        nodeOptions?: string,
        env?: Record<string, string>
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            // "jest/bin/jest", not "jest/bin/jest.js": the jest package's
            // `exports` map publishes the extensionless subpath only, and Node
            // refuses anything the map does not name.
            const jestBin = requireFrom.resolve("jest/bin/jest");
            
            const spawnEnv = {
                ...process.env,
                ...env,
            };

            if (nodeOptions) {
                spawnEnv.NODE_OPTIONS = nodeOptions;
            }

            this.logDebug(
                `Running: ${process.execPath} ${jestBin} ${args.join(" ")}`,
            );

            // `process.execPath` rather than "node": the tests must run on
            // the same runtime as the pipeline, which a bare "node" resolved
            // from PATH is not guaranteed to be — and need not be on PATH at
            // all when kist runs under a version manager.
            const child = spawn(process.execPath, [jestBin, ...args], {
                cwd,
                env: spawnEnv,
                stdio: "inherit",
            });

            child.on("close", (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Jest exited with code ${code}`));
                }
            });

            child.on("error", (error) => {
                reject(error);
            });
        });
    }
}
