# Git Commit Message Plus

A git commit message highlighter being nicer than the built-in one.

Highlighting inspiration from <https://cbea.ms/git-commit>.

## Features

- Inform about `git commit -v` if it isn't being used
- Proper `git commit -v` diff highlighting [even when running `git` in
  not-English](https://github.com/textmate/git.tmbundle/issues/60).
- Highlight file names and what's happening to them
- Report > 72 characters subject lines as errors
- Report > 50 characters subject lines as warnings
- Report not-capitalized subject lines as errors (with Quick Fix)
- Report errors for trailing punctuation
- Report errors for non-blank second lines
- Quick Fixes for certain diagnostics

<!-- FIXME: Add an animated demo here! -->

![Highlighted Git commit message](images/screenshot.png)

### Internal

- Comes with tests using <https://github.com/PanAeon/vscode-tmgrammar-test>
- Comes with unit tests for the diagnostics

### TODO

- Make an icon
- Run the grammar tests in CI
- Highlight current branch name in the Git metadata
- Make sure diagnostics are applied to newly opened files, not just on file
  edits
- Mark commit message subject line with:
  - DONE: `meta.scope.subject.git-commit`
  - `meta.scope.subject-after-50.git-commit` from character 51 and onwards
  - `meta.scope.subject-after-72.git-commit` from character 73 and onwards
- Have unit tests that don't launch VSCode
- Move all tests under the same top subdirectory
- Run code tests in CI
- Validate code formatting in CI

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

To check highlighting in VSCode: "Developer: Inspect Editor Tokens and Scopes"

To publish a new version:

```
npm run publish
```
