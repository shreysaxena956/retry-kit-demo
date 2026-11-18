# retry-kit-demo

A clean, zero-dependency Node.js demo showcasing how to use the published NPM package [`@e25b070798/retry-kit`](https://www.npmjs.com/package/@e25b070798/retry-kit).

## What This Demo Covers

The sample script in [`index.js`](./index.js) demonstrates 3 practical production scenarios:

1. **Flaky Service Recovery:** Retrying a simulated transient 503 network error with exponential backoff, randomized jitter, and `onRetry` logging until the call succeeds.
2. **Fatal Error Bailing:** Using `bail()` to stop retrying immediately when a client error (e.g., HTTP 401 Unauthorized) occurs.
3. **Structured Failure Inspection:** Catching `RetryError` to inspect the full audit trail of attempts, total attempt count, and underlying root cause.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher

### Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### Running the Demo

Execute the demo script using Node:

```bash
npm start
```

## Package Details

- **NPM Registry:** [@e25b070798/retry-kit](https://www.npmjs.com/package/@e25b070798/retry-kit)
- **License:** MIT
