import chokidar from 'chokidar';
import fs from 'fs-extra';
import path from 'path';

const repoRoot = path.resolve(process.cwd(), '..');
const source = path.join(repoRoot, 'shared', 'i18n');
const target = path.join(process.cwd(), 'src', 'i18n');

const sync = async () => {
  await fs.copy(source, target, { overwrite: true });
  console.log('♻ i18n synced');
};

// initial sync
await sync();

chokidar
  .watch(source, { ignoreInitial: true })
  .on('all', async () => {
    await sync();
  });

console.log('👀 Watching shared/i18n...');
