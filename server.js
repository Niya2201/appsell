import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distServer = path.join(__dirname, 'dist', 'server.js');

if (fs.existsSync(distServer)) {
  const res = spawnSync(process.execPath, [distServer, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env,
  });
  process.exit(res.status ?? 0);
} else {
  const res = spawnSync('npx', ['tsx', path.join(__dirname, 'server.ts'), ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env,
  });
  process.exit(res.status ?? 0);
}
