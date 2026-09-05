import { JestAction } from "../../../src/actions/JestAction/JestAction.js";

describe("JestAction", () => {
    let action: JestAction;

    beforeEach(() => {
        action = new JestAction();
    });

    describe("name", () => {
        it("should return the action name", () => {
            expect(action.name).toBe("JestAction");
        });
    });

    describe("describe", () => {
        it("should return a description", () => {
            expect(action.describe()).toContain("Jest");
        });
    });

    describe("validateOptions", () => {
        it("should return true for empty options", () => {
            const result = action.validateOptions({});
            expect(result).toBe(true);
        });

        it("should return true for valid options", () => {
            const result = action.validateOptions({
                coverage: true,
                verbose: true,
                maxWorkers: 4,
            });
            expect(result).toBe(true);
        });

        it("should return true for valid maxWorkers as percentage", () => {
            const result = action.validateOptions({
                maxWorkers: "50%",
            });
            expect(result).toBe(true);
        });

        it("should return false for invalid maxWorkers number", () => {
            const result = action.validateOptions({
                maxWorkers: 0,
            });
            expect(result).toBe(false);
        });

        it("should return false for invalid maxWorkers string", () => {
            const result = action.validateOptions({
                maxWorkers: "invalid",
            });
            expect(result).toBe(false);
        });

        it("should return false for negative bail", () => {
            const result = action.validateOptions({
                bail: -1,
            });
            expect(result).toBe(false);
        });

        it("should return true for valid bail number", () => {
            const result = action.validateOptions({
                bail: 5,
            });
            expect(result).toBe(true);
        });

        it("should return true for bail as boolean", () => {
            const result = action.validateOptions({
                bail: true,
            });
            expect(result).toBe(true);
        });

        it("should return false for invalid coverage threshold", () => {
            const result = action.validateOptions({
                coverageThresholdBranches: 150,
            });
            expect(result).toBe(false);
        });

        it("should return false for negative coverage threshold", () => {
            const result = action.validateOptions({
                coverageThresholdLines: -10,
            });
            expect(result).toBe(false);
        });

        it("should return true for valid coverage thresholds", () => {
            const result = action.validateOptions({
                coverageThresholdBranches: 80,
                coverageThresholdFunctions: 80,
                coverageThresholdLines: 80,
                coverageThresholdStatements: 80,
            });
            expect(result).toBe(true);
        });

        it("should return true with all valid options", () => {
            const result = action.validateOptions({
                configPath: "jest.config.js",
                testPathPattern: "src/**/*.test.ts",
                coverage: true,
                coverageReporters: ["text", "lcov"],
                runInBand: true,
                maxWorkers: 2,
                bail: true,
                verbose: true,
                silent: false,
                forceExit: true,
            });
            expect(result).toBe(true);
        });
    });

    describe("buildArgs", () => {
        // Access private method via any
        const buildArgs = (opts: Parameters<typeof action.validateOptions>[0]) => {
            return (action as any).buildArgs(opts);
        };

        it("should return empty array for empty options", () => {
            const args = buildArgs({});
            expect(args).toEqual([]);
        });

        it("should add --config for configPath", () => {
            const args = buildArgs({ configPath: "jest.config.js" });
            expect(args).toContain("--config");
            expect(args).toContain("jest.config.js");
        });

        it("should add --coverage for coverage option", () => {
            const args = buildArgs({ coverage: true });
            expect(args).toContain("--coverage");
        });

        it("should add --verbose for verbose option", () => {
            const args = buildArgs({ verbose: true });
            expect(args).toContain("--verbose");
        });

        it("should add --runInBand for runInBand option", () => {
            const args = buildArgs({ runInBand: true });
            expect(args).toContain("--runInBand");
        });

        it("should add --maxWorkers for maxWorkers option", () => {
            const args = buildArgs({ maxWorkers: 4 });
            expect(args).toContain("--maxWorkers");
            expect(args).toContain("4");
        });

        it("should add --bail for bail boolean", () => {
            const args = buildArgs({ bail: true });
            expect(args).toContain("--bail");
        });

        it("should add --bail with number for bail number", () => {
            const args = buildArgs({ bail: 5 });
            expect(args).toContain("--bail");
            expect(args).toContain("5");
        });

        it("should add --watch for watch option", () => {
            const args = buildArgs({ watch: true });
            expect(args).toContain("--watch");
        });

        it("should add --updateSnapshot for updateSnapshot option", () => {
            const args = buildArgs({ updateSnapshot: true });
            expect(args).toContain("--updateSnapshot");
        });

        it("should add --forceExit for forceExit option", () => {
            const args = buildArgs({ forceExit: true });
            expect(args).toContain("--forceExit");
        });

        it("should add --coverageThreshold for coverage thresholds", () => {
            const args = buildArgs({
                coverageThresholdBranches: 80,
                coverageThresholdFunctions: 75,
            });
            expect(args).toContain("--coverageThreshold");
            const thresholdIndex = args.indexOf("--coverageThreshold");
            const threshold = JSON.parse(args[thresholdIndex + 1]);
            expect(threshold.global.branches).toBe(80);
            expect(threshold.global.functions).toBe(75);
        });

        it("should forward testMatch patterns", () => {
            // `testMatch` was declared and documented but never reached the
            // CLI, so setting it silently ran Jest's default discovery.
            const args = buildArgs({
                testMatch: ["**/*.spec.ts", "**/*.test.ts"],
            });
            const matchCount = args.filter(
                (a: string) => a === "--testMatch",
            ).length;
            expect(matchCount).toBe(2);
            expect(args).toContain("**/*.spec.ts");
            expect(args).toContain("**/*.test.ts");
        });

        it("should omit testMatch when it is not set", () => {
            expect(buildArgs({})).not.toContain("--testMatch");
        });

        it("should add multiple coverageReporters", () => {
            const args = buildArgs({
                coverageReporters: ["text", "lcov", "html"],
            });
            const reporterCount = args.filter((a: string) => a === "--coverageReporters").length;
            expect(reporterCount).toBe(3);
            expect(args).toContain("text");
            expect(args).toContain("lcov");
            expect(args).toContain("html");
        });
    });
});
