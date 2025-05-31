#!/usr/bin/env node

require('child_process').spawnSync(
  process.execPath,
  ['-e', 'require("tsx/cli").run(["./src/index.ts"])'],
  { stdio: 'inherit' }
);
