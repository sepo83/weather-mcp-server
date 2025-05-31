#!/usr/bin/env node

require('ts-node/register');

try {
  require('../src/index.ts');
} catch (error) {
  console.error('Failed to start the server:', error);
  process.exit(1);
}
