// Shows that `svelte-kit sync` rewrites .svelte-kit/types/src/routes/$types.d.ts in place
// (truncate, then write), so a concurrent reader (typed lint, tsc, an editor) can see 0 bytes.
import { spawn } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const file = '.svelte-kit/types/src/routes/$types.d.ts';
const runs = 60;

function sync() {
	return new Promise((resolve) =>
		spawn('pnpm', ['exec', 'svelte-kit', 'sync'], { stdio: 'ignore' }).on('close', resolve)
	);
}

await sync(); // create the file once
let reads = 0;
let empty = 0;
let done = false;
const poll = (async () => {
	while (!done) {
		try {
			reads++;
			if (readFileSync(file, 'utf-8').length === 0) empty++;
		} catch {}
		await new Promise((r) => setImmediate(r));
	}
})();

for (let i = 0; i < runs; i++) await sync();
done = true;
await poll;
console.log(`${runs} syncs, ${reads} reads of $types.d.ts, ${empty} saw an empty file`);
console.log(`final size: ${statSync(file).size} bytes`);
process.exit(empty > 0 ? 1 : 0);
