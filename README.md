![CI Status](https://github.com/walles/git-commit-message-plus/actions/workflows/ci.yml/badge.svg?branch=main)

# Git Commit Message Plus

A git commit message highlighter being nicer than the built-in one.

Report issues here: <https://github.com/walles/git-commit-message-plus/issues>

## Prep

[Set VSCode as your Git commit
editor](https://code.visualstudio.com/docs/sourcecontrol/overview#_vs-code-as-git-editor).
Then when you `git commit`, you'll be supported in [writing good Git commit
messages](https://cbea.ms/git-commit).

## Features

- Highlight file names and what's happening to them
- Quick Fixes for certain diagnostics
- Inform about `git commit -v` if it isn't being used
- Code completion for JIRA issue IDs based on branch name
- Diagnostics for:
  - \> 50 characters subject lines
  - \> 72 characters subject lines
  - Not-capitalized subject lines (with Quick Fix)
  - Trailing punctuation in the subject line (with Quick Fix)
  - Not-capitalized JIRA issue IDs (with Quick Fix)
  - JIRA issue ID conflicting with branch name (with Quick Fix)
  - Non-blank second lines

<!-- FIXME: Add an animated demo here! -->

![Highlighted Git commit message](images/screenshot.png)

### Internal

- Comes with tests using <https://github.com/PanAeon/vscode-tmgrammar-test>
- Comes with unit tests for the diagnostics

### TODO

- Only warn about missing `git commit -v` in `COMMIT_EDITMSG` files, not in
  others. Both for the Quick Fix and the Diagnostic.
- Consider the tests for no-diffs for both diagnostics and quick fixes. Are we
  really testing for comment-line followed by an empty line at the end?
- Disable `@typescript-eslint/no-non-null-assertion` in `*.test.*` files, or in
  the whole `suite` directory
- Highlight current branch name in the Git metadata
- Validate code formatting in CI and fail on violations
- Fail CI on linter warnings
- Move all tests under the same top subdirectory

## Development

To run the unit tests:

```
npm install && npm test
```

To install into VSCode:

1. `npm run package`
1. In VSCode:
   - Click Extensions
   - Click the ... menu in the top right corner
   - Click Install from VSIX...
   - Pick the `99.99.99` one, that's the perpetual development version

To check highlighting in VSCode: "Developer: Inspect Editor Tokens and Scopes"

To publish a new version:

```
npm run publish
```
