# Git Commit Message Plus

A git commit message highlighter being nicer than the built-in one.

## Features

- Proper `git commit -v` diff highlighting [even when running `git` in
  not-English](https://github.com/textmate/git.tmbundle/issues/60).

<!-- FIXME: Add an animated demo here! -->

### Internal

- Comes with tests using <https://github.com/PanAeon/vscode-tmgrammar-test>

### TODO

- Make an icon
- `npm test` in CI
- Add a print margin
- Mark too long subject lines as errors with hover help and stuff.
- No highlighting of too-long subject lines, leave that to the error
  reporting ^.
- Mark trailing punctuation as an error with hover help and stuff.
- Mark any second-line text as an error with hover help and stuff.
- Mark commit message subject line in bold, it _is_ a heading after all.

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

To publish a new version:

```
npm run publish
```
