import { Action } from "../../types/Action.js";
import { spawn } from "child_process";

/**
 * Options for the JestAction
 */
export interface JestActionOptions {
    /**
     * Path to Jest config file
     */
    configPath?: string;

    /**
     * Test file patterns to run
     */
    testMatch?: string[];

    /**
     * Specific test files or directories to run
     */
    testPathPattern?: string;

    /**
     * Run tests in watch mode
     */
    watch?: boolean;

    /**
     * Run all tests when watch mode detects changes
     */
    watchAll?: boolean;

    /**
     * Generate coverage report
     */
    coverage?: boolean;

    /**
     * Coverage reporters to use
     */
    coverageReporters?: string[];

    /**
     * Coverage threshold for branches
     */
    coverageThresholdBranches?: number;

    /**
     * Coverage threshold for functions
     */
    coverageThresholdFunctions?: number;

    /**
     * Coverage threshold for lines
     */
    coverageThresholdLines?: number;

    /**
     * Coverage threshold for statements
     */
    coverageThresholdStatements?: number;

    /**
     * Run tests serially (not in parallel)
     */
    runInBand?: boolean;

    /**
     * Maximum number of workers for parallel runs
     */
    maxWorkers?: number | string;

    /**
     * Only run tests related to changed files
     */
    onlyChanged?: boolean;

    /**
     * Fail fast on first test failure
     */
    bail?: boolean | number;

    /**
     * Update snapshots
     */
    updateSnapshot?: boolean;

    /**
     * Clear mocks between every test
     */
    clearMocks?: boolean;

    /**
     * Reset mocks between every test
     */
    resetMocks?: boolean;

    /**
     * Verbose output
     */
    verbose?: boolean;

    /**
     * Silent mode - prevent tests from printing messages
     */
    silent?: boolean;

    /**
     * Pass through additional Jest CLI arguments
     */
    passWithNoTests?: boolean;

    /**
     * Detect open handles
     */
    detectOpenHandles?: boolean;

    /**
     * Force exit after tests complete
     */
    forceExit?: boolean;

    /**
     * Test name pattern to filter tests
     */
    testNamePattern?: string;

    /**
     * Working directory for running Jest
     */
    cwd?: string;

    /**
     * Additional Node options (e.g., --experimental-vm-modules)
     */
    nodeOptions?: string;

    /**
     * Additional environment variables
     */
    env?: Record<string, string>;
}

/**
 * Action for running tests using Jest.
 */
export class JestAction extends Action<JestActionOptions> {
    readonly name = "JestAction";

    describe(): string {
        return "Run tests using Jest test framework";
    }

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
     * Build Jest CLI arguments from options
     */
    private buildArgs(options: JestActionOptions): string[] {
        const args: string[] = [];

        if (options.configPath) {
            args.push("--config", options.configPath);
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
     * Run Jest with the given arguments
     */
    private runJest(
        args: string[], 
        cwd: string, 
        nodeOptions?: string,
        env?: Record<string, string>
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const jestBin = require.resolve("jest/bin/jest.js");
            
            const spawnEnv = {
                ...process.env,
                ...env,
            };

            if (nodeOptions) {
                spawnEnv.NODE_OPTIONS = nodeOptions;
            }

            this.logDebug(`Running: node ${jestBin} ${args.join(" ")}`);

            const child = spawn("node", [jestBin, ...args], {
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
