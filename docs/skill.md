# AI agent skill

Magma UI ships an agent skill that teaches coding assistants how to install the
library and write correct component markup. It is a Markdown skill, not a
runtime dependency: it only adds instructions and references for the agent.

## What the skill covers

- Installing and registering Magma UI with Alpine or Livewire.
- The canonical markup contract: root classes, `x-ref="trigger"`,
  `x-ref="menu"` / `x-ref="panel"`, `menuStyle`, `x-show`, `x-cloak` and
  outside-click handling.
- The 16 factories, their main options and their `magma-*` events.
- The date/time picker: eight modes, value shapes, inline rendering,
  double-month range and customizable shortcuts.
- Remote selectors, Livewire integration, notifications and theming tokens.
- A short verification checklist to run before reporting a UI change done.

## Files

```text
skills/magma-ui/
├── SKILL.md
└── references/
    ├── components.md
    └── date-time-picker.md
```

`SKILL.md` is the entry point loaded when the skill triggers. The two references
are read on demand for detailed component APIs and the date/time picker.

## Requirements

- The project uses the package (or you want the agent to write code for it):

  ```bash
  npm install @momoledev/alpine-magma-ui-component alpinejs
  ```

- An agent that supports `SKILL.md` skills: Claude Code, ZCode, or another tool
  reading `.agents/skills/`, `.claude/skills/` or `~/.claude/skills/`.

The skill does not need network access, credentials or scripts.

## Install for one project (Claude Code)

Run from the project root:

```bash
PKG="$(npm root)/@momoledev/alpine-magma-ui-component"
mkdir -p .claude/skills
cp -R "$PKG/skills/magma-ui" .claude/skills/
```

Result:

```text
.claude/skills/magma-ui/SKILL.md
.claude/skills/magma-ui/references/components.md
.claude/skills/magma-ui/references/date-time-picker.md
```

Commit `.claude/skills/magma-ui/` if every contributor should get the skill with
the repository.

## Install for one project (ZCode and `.agents` compatible tools)

ZCode discovers project skills in `.agents/skills/`; `.zcode/skills/` takes
priority when you need to override a skill. Use `.agents/skills/` for a
cross-tool installation:

```bash
PKG="$(npm root)/@momoledev/alpine-magma-ui-component"
mkdir -p .agents/skills
cp -R "$PKG/skills/magma-ui" .agents/skills/
```

## Install globally for the current user

Claude Code, global:

```bash
PKG="$(npm root -g)/@momoledev/alpine-magma-ui-component"
mkdir -p ~/.claude/skills
cp -R "$PKG/skills/magma-ui" ~/.claude/skills/
```

ZCode, global:

```bash
mkdir -p ~/.agents/skills
cp -R "$PKG/skills/magma-ui" ~/.agents/skills/
```

`.zcode/skills/` is also discovered and takes priority over `.agents/skills/`.
Use it only when you intentionally want to override the cross-tool copy:

```bash
mkdir -p ~/.zcode/skills
cp -R "$PKG/skills/magma-ui" ~/.zcode/skills/
```

If the package is installed locally rather than globally, point `PKG` at the
local `node_modules` path shown above.

## Install from the source repository

Without an npm install, copy the folder from a clone:

```bash
git clone git@github.com:momostifler96/alpine-components-magma-ui.git
mkdir -p .claude/skills
cp -R alpine-components-magma-ui/skills/magma-ui .claude/skills/
```

## Verify the installation

```bash
test -f .claude/skills/magma-ui/SKILL.md && echo "skill installed"
grep -E '^(name|description):' .claude/skills/magma-ui/SKILL.md
test -f .claude/skills/magma-ui/references/date-time-picker.md && echo "references ok"
```

The first lines must be:

```yaml
---
name: magma-ui
description: ...
---
```

If the agent does not pick it up from context, name it explicitly:

```text
Use the magma-ui skill to add a remote country selector bound to Livewire.
```

```text
Utilise le skill magma-ui pour ajouter un date picker inline avec des
raccourcis « ce mois » et « 3 derniers mois ».
```

From the Magma UI repository, `npm run check:skill` validates the frontmatter,
the reference files, the install guide and the `files` entry in `package.json`.

## Update the skill

The skill is versioned with the package. After upgrading Magma UI, refresh the
installed copy:

```bash
PKG="$(npm root)/@momoledev/alpine-magma-ui-component"
rm -rf .claude/skills/magma-ui
cp -R "$PKG/skills/magma-ui" .claude/skills/
```

This overwrites local edits. Keep project-specific instructions in a separate
skill or in the project's `AGENTS.md` / `CLAUDE.md` instead of editing the
shipped copy.

## Uninstall

```bash
rm -rf .claude/skills/magma-ui
# or
rm -rf .agents/skills/magma-ui
```

## Maintenance notes

- `SKILL.md` must keep its YAML frontmatter with `name: magma-ui`; the directory
  name must match.
- Keep the body under roughly 500 lines. Put detailed API tables in
  `references/` so agents load them only when needed.
- Update `references/components.md` and `references/date-time-picker.md` in the
  same commit as the component API changes. The skill points agents at the
  installed package's `docs/` as the source of truth.
- The npm package includes `skills/` (see `files` in `package.json`), so the
  copy commands work after a normal install.
