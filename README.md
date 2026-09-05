# @getkist/action-jest

<div align="center">

[![npm version](https://img.shields.io/npm/v/@getkist/action-jest?style=flat-square&logo=npm&logoColor=FFFFFF&labelColor=5e4d34&color=5e4d34)](https://www.npmjs.com/package/@getkist/action-jest)
[![CI](https://img.shields.io/github/actions/workflow/status/getkist/kist-action-jest/ci.yml?style=flat-square&logo=githubactions&logoColor=FFFFFF&label=CI&labelColor=5e4d34&color=5e4d34)](https://github.com/getkist/kist-action-jest/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/getkist/kist-action-jest?style=flat-square&logo=codecov&logoColor=FFFFFF&label=Coverage&labelColor=5e4d34&color=5e4d34)](https://codecov.io/gh/getkist/kist-action-jest)
[![License: MIT](https://img.shields.io/badge/License-MIT-5e4d34?style=flat-square)](https://opensource.org/licenses/MIT)
[![kist plugin](https://img.shields.io/badge/kist-plugin-5e4d34?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN3Y2YzAgNS41NSAzLjg0IDEwLjc0IDEwIDEyIDYuMTYtMS4yNiAxMC02LjQ1IDEwLTEyVjdMMTIgMnoiLz48L3N2Zz4=)](https://github.com/getkist/kist)

</div>

Jest test runner action for [kist](https://github.com/getkist/kist) build tool.

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
| -------- | ------ | --------- | ------------- |
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
| `testNamePattern` | string | - | Only run tests whose full name (describe + it) matches this regex pattern |
| `cwd` | string | `process.cwd()` | Working directory Jest is spawned from |
| `nodeOptions` | string | - | Additional value for the `NODE_OPTIONS` environment variable passed to the spawned Jest process (e.g. `--experimental-vm-modules`) |
| `env` | object | - | Extra environment variables to set on the spawned Jest process |

## Requirements

- Node.js >= 22.0.0
- kist >= 0.1.58

## License

MIT
