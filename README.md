# Git Commit Message Plus

A git commit message highlighter being nicer than the built-in one.

## Features

- Proper `git commit -v` diff highlighting [even when running `git` in
  not-English](https://github.com/textmate/git.tmbundle/issues/60).
- Warn about > 72 characters subject lines
- Hint about > 50 characters subject lines
- Report errors for trailing punctuation
- Report errors for non-blank second lines
- No colorization of too-long subject lines, that is instead done by the error
  reporting.

<!-- FIXME: Add an animated demo here! -->

### Internal

- Comes with tests using <https://github.com/PanAeon/vscode-tmgrammar-test>
- Comes with unit tests for the diagnostics

### TODO

- Make sure diagnostics are applied to newly opened files, not just on file
  edits
- Make an icon
- Have unit tests that don't launch VSCode
- Mark commit message subject line in bold, it _is_ a heading after all.
- Move all tests under the same top subdirectory
- `npm test` in CI
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

To publish a new version:

```
npm run publish
```

[diagnostics-docs]: https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics
[sample-extension]: https://github.com/gbuktenica/Unicode-Substitutions
