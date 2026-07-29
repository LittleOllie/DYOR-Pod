# DO NOT ADD!

Local and generated files live here. **Do not commit this folder’s contents to GitHub.**

Only this README is tracked in git. Everything else under `DO NOT ADD!/` is ignored via `.gitignore`.

## What goes in this folder

| Folder / file | What it is |
|---------------|------------|
| `test-results/` | Playwright test output |
| `playwright-report/` | Playwright HTML reports |
| `coverage/` | Vitest coverage reports (when you run tests with coverage) |

## What must stay at the project root (still not on GitHub)

These tools expect fixed paths, so they cannot live here. They are already excluded by `.gitignore`:

| Path | Why it stays at root |
|------|----------------------|
| `node_modules/` | npm installs dependencies here |
| `.next/` | Next.js build cache and dev output |
| `.env`, `.env.local`, etc. | Environment secrets |
| `tsconfig.tsbuildinfo` | TypeScript incremental cache |
| `next-env.d.ts` | Auto-generated Next.js types |

## Before you push

From the project root:

```bash
git status
```

You should **not** see `node_modules`, `.next`, `.env`, or anything inside `DO NOT ADD!/` (except this README if it changed).
