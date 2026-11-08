---
name: git-commits-no-agent
description: >-
  Use whenever staging or creating git commits. Keeps authorship human-only: no
  Cursor/AI co-author trailers, no agent committer identity, no Co-authored-by lines.
---

# Git commits (no agent attribution)

Apply this skill for every commit the user requests or that you create on their behalf.

**Important:** Cursor may append `Co-authored-by: Cursor <cursoragent@cursor.com>` at the **tooling** layer after `git commit`, even when the model does not. That is not a separate git author (Author/Committer stay the user) but GitHub shows a second contributor. Mitigations:

1. **Cursor Settings → Git & PRs → Attribution** — turn off **Commit attribution** (and PR if desired).
2. **`%USERPROFILE%\.cursor\cli-config.json`** — `"attribution": { "attributeCommitsToAgent": false, "attributePRsToAgent": false }`.
3. **Global hook** — `%USERPROFILE%\.githooks\commit-msg` via `git config --global core.hooksPath` (strips agent trailers).

## Rules

1. **Author identity** — Commits must use whatever `user.name` and `user.email` git already has for this repo. Do not set `GIT_AUTHOR_*`, `GIT_COMMITTER_*`, or `git -c user.email=...` to agent identities.

2. **No co-author trailers** — Never add:
   - `Co-authored-by: Cursor <cursoragent@cursor.com>`
   - Any `Co-authored-by:` line naming Cursor, Composer, Claude, Codex, or other assistants.

3. **Message shape** — Use plain `git commit -m "subject" -m "body"` (or a single `-m`). Do not append trailer blocks to the message.

4. **Hooks and wrappers** — If a command would inject agent attribution (shell profile, IDE hook, `prepare-commit-msg`), use a commit path that does not add trailers, or tell the user which hook to disable.

5. **Amend** — Do not amend an existing user commit only to add agent attribution.

6. **Style** — Match recent `git log` on the branch; focus on why, not a dump of filenames.

## Checklist before `git commit`

- [ ] Message has no `Co-authored-by` lines
- [ ] No agent email in author/committer fields
- [ ] Only files the user asked to commit are staged
