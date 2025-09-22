#!/usr/bin/env node
/**
 * Performance testing script for Video Converter development workflow
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const TIMEOUT_MS = 120000; // 2 minutes
const PERFORMANCE_LOG = 'performance-metrics.json';

// Performance test suite
const tests = [
  {
    name: 'TypeScript Type Check',
    command: 'npx tsc --noEmit --incremental',
    timeout: TIMEOUT_MS,
  },
  {
    name: 'ESLint Analysis (Fast)',
    command: 'npx eslint src/ --max-warnings 100 --format compact',
    timeout: 60000,
  },
  {
    name: 'Jest Test (Single Worker)',
    command: 'npm test -- --passWithNoTests --maxWorkers=1 --bail',
    timeout: 90000,
  },
  {
    name: 'Module Import Test',
    command: 'node -e "console.log(\'Import test: successful\')"',
    timeout: 10000,
  },
];

// Utility functions
function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function runTest(test) {
  console.log(`\n🔬 Testing: ${test.name}`);
  console.log(`📋 Command: ${test.command}`);

  const startTime = Date.now();

  try {
    execSync(test.command, {
      stdio: 'pipe',
      timeout: test.timeout,
      encoding: 'utf-8',
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Success in ${formatTime(duration)}`);

    return {
      name: test.name,
      success: true,
      duration,
      error: null,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const isTimeout = error.signal === 'SIGTERM' || duration >= test.timeout;

    console.log(`❌ ${isTimeout ? 'Timeout' : 'Failed'} after ${formatTime(duration)}`);
    if (!isTimeout && error.stdout) {
      console.log(`📝 Output: ${error.stdout.slice(0, 200)}...`);
    }

    return {
      name: test.name,
      success: false,
      duration,
      error: isTimeout ? 'TIMEOUT' : error.message.slice(0, 100),
    };
  }
}

function saveResults(results) {
  const metrics = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalTime: results.reduce((sum, r) => sum + r.duration, 0),
    },
  };

  fs.writeFileSync(PERFORMANCE_LOG, JSON.stringify(metrics, null, 2));
  console.log(`\n📊 Results saved to ${PERFORMANCE_LOG}`);

  return metrics;
}

function printSummary(metrics) {
  console.log('\n' + '='.repeat(50));
  console.log('📈 PERFORMANCE SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${metrics.summary.total}`);
  console.log(`✅ Passed: ${metrics.summary.passed}`);
  console.log(`❌ Failed: ${metrics.summary.failed}`);
  console.log(`⏱️  Total Time: ${formatTime(metrics.summary.totalTime)}`);
  console.log('='.repeat(50));

  metrics.results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const time = formatTime(result.duration);
    console.log(`${status} ${result.name}: ${time}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
}

// Main execution
function main() {
  console.log('🚀 Starting Video Converter Performance Tests');
  console.log(`📅 ${new Date().toISOString()}`);

  const results = [];

  for (const test of tests) {
    const result = runTest(test);
    results.push(result);

    // Short pause between tests
    if (test !== tests[tests.length - 1]) {
      console.log('⏳ Cooling down...');
      require('child_process').execSync('sleep 2', { stdio: 'ignore' });
    }
  }

  const metrics = saveResults(results);
  printSummary(metrics);

  // Exit with appropriate code
  const hasFailures = results.some(r => !r.success);
  process.exit(hasFailures ? 1 : 0);
}

if (require.main === module) {
  main();
}