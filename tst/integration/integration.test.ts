import { jest } from "@jest/globals";

import fs from "fs/promises";
import path from "path";

import { JestAction } from "../../src/actions/JestAction/JestAction.js";

/**
 * Spawns a real Jest run against a throwaway project. That is the whole point
 * of this action — the unit tests can only check the argument list it builds,
 * not whether Jest accepts it.
 */
describe("JestAction integration", () => {
    const tmpDir = path.join(process.cwd(), "tst", "integration", `.tmp-${Date.now()}`);

    // Each case spawns a Node process running Jest; the default 5s is not enough.
    jest.setTimeout(120_000);

    async function scaffold(name: string, testBody: string) {
        const dir = path.join(tmpDir, name);
        await fs.mkdir(path.join(dir, "tst"), { recursive: true });
        await fs.writeFile(
            path.join(dir, "jest.config.cjs"),
            "module.exports = { testEnvironment: 'node', rootDir: '.' };\n",
            "utf8",
        );
        await fs.writeFile(path.join(dir, "tst", "sample.test.js"), testBody, "utf8");
        return dir;
    }

    beforeAll(async () => {
        await fs.mkdir(tmpDir, { recursive: true });
    });

    afterAll(async () => {
        await fs.rm(tmpDir, { recursive: true, force: true });
    });

    it("resolves when the spawned suite passes", async () => {
        const cwd = await scaffold(
            "passing",
            "test('adds', () => { expect(1 + 1).toBe(2); });\n",
        );

        await expect(
            new JestAction().execute({ cwd, configPath: "jest.config.cjs" }),
        ).resolves.toBeUndefined();
    });

    // A failing suite must fail the pipeline step; a test action that swallows
    // a red suite is worse than no test action at all.
    it("rejects when the spawned suite fails", async () => {
        const cwd = await scaffold(
            "failing",
            "test('is wrong', () => { expect(1 + 1).toBe(3); });\n",
        );

        await expect(
            new JestAction().execute({ cwd, configPath: "jest.config.cjs" }),
        ).rejects.toThrow();
    });

    it("writes a coverage report when coverage is enabled", async () => {
        const cwd = await scaffold(
            "covered",
            "test('adds', () => { expect(1 + 1).toBe(2); });\n",
        );

        await new JestAction().execute({
            cwd,
            configPath: "jest.config.cjs",
            coverage: true,
            coverageReporters: ["lcov"],
        });

        await expect(
            fs.access(path.join(cwd, "coverage", "lcov.info")),
        ).resolves.toBeUndefined();
    });

    it("runs only the tests matching testNamePattern", async () => {
        const cwd = await scaffold(
            "filtered",
            "test('keep me', () => { expect(true).toBe(true); });\n" +
                "test('skip me', () => { throw new Error('should not run'); });\n",
        );

        // The second test would fail if it ran, so resolving proves it did not.
        await expect(
            new JestAction().execute({
                cwd,
                configPath: "jest.config.cjs",
                testNamePattern: "keep me",
            }),
        ).resolves.toBeUndefined();
    });

    it("rejects when the config file does not exist", async () => {
        const cwd = await scaffold(
            "missing-config",
            "test('adds', () => { expect(1 + 1).toBe(2); });\n",
        );

        await expect(
            new JestAction().execute({ cwd, configPath: "no-such.config.cjs" }),
        ).rejects.toThrow();
    });
});
