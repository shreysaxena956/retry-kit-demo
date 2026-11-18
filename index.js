import { retry, bail, RetryError } from '@e25b070798/retry-kit';

console.log('='.repeat(60));
console.log('  @e25b070798/retry-kit Demo');
console.log('='.repeat(60) + '\n');

// -------------------------------------------------------------
// Scenario 1: Flaky API recovery with backoff, jitter & logging
// -------------------------------------------------------------
async function demoFlakyApi() {
  console.log('[Scenario 1] Calling a flaky microservice (fails twice, succeeds on attempt 3)...');

  let attemptsMade = 0;

  async function mockNetworkRequest(attempt) {
    attemptsMade++;
    if (attemptsMade < 3) {
      const err = new Error('503 Service Unavailable (rate limit / cold start)');
      err.code = 'SERVICE_UNAVAILABLE';
      throw err;
    }
    return { status: 200, data: { orderId: 'ord_98241', total: 49.99 } };
  }

  const result = await retry(mockNetworkRequest, {
    retries: 4,
    delay: 200,
    factor: 2,
    jitter: true,
    onRetry({ error, attempt, delay }) {
      console.log(`  -> Attempt ${attempt} failed: "${error.message}"`);
      console.log(`     Backing off for ${delay}ms before next retry...`);
    }
  });

  console.log(`  ✓ Succeeded after ${attemptsMade} attempts:`, JSON.stringify(result.data));
  console.log();
}

// -------------------------------------------------------------
// Scenario 2: Immediate halt on non-retryable client error (bail)
// -------------------------------------------------------------
async function demoBailOnFatalError() {
  console.log('[Scenario 2] Halting retries immediately when hitting a 401 Unauthorized...');

  let calls = 0;

  try {
    await retry(
      async () => {
        calls++;
        const error = new Error('401 Invalid API Token');
        error.status = 401;

        // Bail out immediately so we don't spam retries on auth failure
        throw bail(error);
      },
      {
        retries: 3,
        delay: 100,
        onRetry({ attempt }) {
          console.log(`  -> Retrying attempt ${attempt}...`);
        }
      }
    );
  } catch (err) {
    console.log(`  ✓ Bailed out immediately on attempt ${calls}: "${err.message}" (no unnecessary retries)`);
  }
  console.log();
}

// -------------------------------------------------------------
// Scenario 3: Exhausted attempts throwing structured RetryError
// -------------------------------------------------------------
async function demoExhaustedRetries() {
  console.log('[Scenario 3] Exhausting retries and inspecting structured RetryError...');

  try {
    await retry(
      async () => {
        throw new Error('Database connection timed out');
      },
      {
        retries: 2,
        delay: 50,
        jitter: false,
        onRetry({ attempt, delay }) {
          console.log(`  -> Attempt ${attempt} failed, waiting ${delay}ms...`);
        }
      }
    );
  } catch (err) {
    if (err instanceof RetryError) {
      console.log(`  ✓ Caught RetryError cleanly:`);
      console.log(`     - Total attempts: ${err.attempts}`);
      console.log(`     - Errors recorded: ${err.errors.length}`);
      console.log(`     - Last error cause: "${err.cause?.message}"`);
    } else {
      console.error('Unexpected error:', err);
    }
  }
  console.log();
}

// Run all scenarios sequentially
async function run() {
  await demoFlakyApi();
  await demoBailOnFatalError();
  await demoExhaustedRetries();
  console.log('All demo scenarios completed successfully!');
}

run();
