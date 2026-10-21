import { access, readFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const skillDir = resolve(root, 'skills/magma-ui');
const skillPath = resolve(skillDir, 'SKILL.md');

const fail = (message) => {
    console.error(`check-skill: ${message}`);
    process.exitCode = 1;
};

const source = await readFile(skillPath, 'utf8').catch(() => null);

if (!source) {
    fail(`missing ${skillPath}`);
} else {
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/);

    if (!frontmatter) {
        fail('SKILL.md must start with YAML frontmatter');
    } else {
        const meta = Object.fromEntries(
            frontmatter[1]
                .split('\n')
                .filter((line) => line.includes(':'))
                .map((line) => {
                    const index = line.indexOf(':');

                    return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
                })
        );

        if (meta.name !== basename(skillDir)) {
            fail(`frontmatter name "${meta.name}" must match the directory "${basename(skillDir)}"`);
        }

        if (!meta.description || meta.description.length > 1024) {
            fail('frontmatter description is required and must be at most 1024 characters');
        }

        const bodyLines = source.split('\n').length;

        if (bodyLines > 500) {
            fail(`SKILL.md is ${bodyLines} lines; keep the body under 500 and move details to references/`);
        }
    }
}

for (const relative of ['references/components.md', 'references/date-time-picker.md']) {
    await access(resolve(skillDir, relative)).catch(() => fail(`missing ${relative}`));
}

await access(resolve(root, 'docs/skill.md')).catch(() => fail('missing docs/skill.md'));

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));

if (!packageJson.files?.includes('skills')) {
    fail('package.json files must include "skills" so the skill ships in the npm package');
}

if (!process.exitCode) {
    console.log('skill ok: magma-ui (SKILL.md, 2 references, install guide, packaged)');
}
