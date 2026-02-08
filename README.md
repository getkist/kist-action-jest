# @getkist/action-jest

Jest test runner action for [kist](https://github.com/getkist/kist) build tool.

[![npm version](https://img.shields.io/npm/v/@getkist/action-jest.svg)](https://www.npmjs.com/package/@getkist/action-jest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Jest Integration** - Run Jest tests as part of your kist build pipeline
- **Full Configuration** - Support for all Jest CLI options
- **Coverage Reports** - Built-in coverage threshold support
- **Watch Mode** - Development-friendly watch mode integration
- **Parallel Execution** - Control worker allocation for test runs

## Installation

```bash
npm install --save-dev @getkist/action-jest
```

## Usage

### Basic Test Run

Add to your `kist.yml`:

```yaml
pipeline:
    stages:
        - name: test
          steps:
              - name: run-tests
                action: JestAction
```

### With Coverage

```yaml
pipeline:
    stages:
        - name: test
          steps:
              - name: run-tests-with-coverage
                action: JestAction
                options:
                    coverage: true
                    coverageReporters:
                        - text
                        - lcov
                    coverageThresholdLines: 80
                    coverageThresholdBranches: 70
```

### Custom Configuration

```yaml
pipeline:
    stages:
        - name: test
          steps:
              - name: unit-tests
                action: JestAction
                options:
                    configPath: ./jest.config.js
                    testPathPattern: "src/**/*.test.ts"
                    runInBand: true
                    verbose: true
                    bail: 1
```

## Action: JestAction

Runs Jest tests with configurable options.

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `configPath` | string | - | Path to Jest config file |
| `testMatch` | string[] | - | Test file patterns to run |
| `testPathPattern` | string | - | Regex pattern for test file paths |
| `watch` | boolean | false | Run in watch mode |
| `watchAll` | boolean | false | Run all tests when watch detects changes |
| `coverage` | boolean | false | Generate coverage report |
| `coverageReporters` | string[] | - | Coverage reporters (text, lcov, html, etc.) |
| `coverageThresholdBranches` | number | - | Minimum branch coverage % |
| `coverageThresholdFunctions` | number | - | Minimum function coverage % |
| `coverageThresholdLines` | number | - | Minimum line coverage % |
| `coverageThresholdStatements` | number | - | Minimum statement coverage % |
| `runInBand` | boolean | false | Run tests serially |
| `maxWorkers` | number/string | - | Max parallel workers |
| `onlyChanged` | boolean | false | Only run tests for changed files |
| `bail` | boolean/number | false | Stop after N failures |
| `updateSnapshot` | boolean | false | Update snapshots |
| `clearMocks` | boolean | false | Clear mocks between tests |
| `resetMocks` | boolean | false | Reset mocks between tests |
| `verbose` | boolean | false | Verbose output |
| `silent` | boolean | false | Suppress console output |
| `forceExit` | boolean | false | Force Jest to exit after tests |
| `detectOpenHandles` | boolean | false | Detect open handles preventing exit |
| `passWithNoTests` | boolean | false | Pass when no tests found |
| `reporters` | string[] | - | Custom Jest reporters |
| `projects` | string[] | - | Projects to run |
| `roots` | string[] | - | Test root directories |
| `setupFilesAfterEnv` | string[] | - | Setup files to run after env |
| `testEnvironment` | string | - | Test environment (node, jsdom) |
| `testTimeout` | number | - | Test timeout in ms |
| `globals` | object | - | Global variables |
| `moduleNameMapper` | object | - | Module path mappings |

## Requirements

- Node.js >= 20.0.0
- kist >= 0.1.58

## License

MIT