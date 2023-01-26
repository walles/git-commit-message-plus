# Git Commit Message Plus

A git commit message highlighter being nicer than the built-in one.

## Features

- Proper `git commit -v` diff highlighting [even when running `git` in
  not-English](https://github.com/textmate/git.tmbundle/issues/60).
- Warn about > 72 characters subject lines
- Hint about > 50 characters subject lines
- Report errors for trailing punctuation
- Report errors for non-blank second lines

<!-- FIXME: Add an animated demo here! -->

### Internal

- Comes with tests using <https://github.com/PanAeon/vscode-tmgrammar-test>
- Comes with unit tests for the diagnostics

### TODO

- Add diagnostic. Inspiration from [the docs][diagnostics-docs] and from [an
  extension][sample-extension].
  - Mark any second-line text as an error with hover help and stuff.
  - Make sure diagnostics are applied to newly opened files, not just on file
    edits
  - Have unit tests that don't launch VSCode
  - Run our linting inside of a promise?
- No highlighting of too-long subject lines, leave that to the error
  reporting ^.
- Make an icon
- Move all tests under the same top subdirectory
- `npm test` in CI
- Validate code formatting in CI
- Mark commit message subject line in bold, it _is_ a heading after all.
- Add a print margin. Can we [configure the default setting for our
  language](https://stackoverflow.com/questions/42607666/how-to-add-a-right-margin-to-the-visual-studio-code-editor)?

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
