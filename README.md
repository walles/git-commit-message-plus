# Git Commit Message Plus

A git commit message highlighter being nicer than the built-in one.

## Features

- Proper `git commit -v` diff highlighting [even when running `git` in
  not-English](https://github.com/textmate/git.tmbundle/issues/60).
- Report > 72 characters subject lines as errors
- Report > 50 characters subject lines as warnings
- Report not-capitalized subject lines as errors
- Report errors for trailing punctuation
- Report errors for non-blank second lines
- No colorization of too-long subject lines, that is instead done by the error
  reporting.

<!-- FIXME: Add an animated demo here! -->

### Internal

- Comes with tests using <https://github.com/PanAeon/vscode-tmgrammar-test>
- Comes with unit tests for the diagnostics

### TODO

- Mark commit message subject line in bold, it _is_ a heading after all. Maybe
  not-bold it after character 50? And even lowlight characters 73 and onwards?
- Add Quick Fixes for some of our diagnostics
- Make an icon
- The grammar contains the text `Changes to be committed`. Check what that does
  and make sure it works in Swedish as well.
- Make sure diagnostics are applied to newly opened files, not just on file
  edits
- Have unit tests that don't launch VSCode
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

To check highlighting in VSCode: "Developer: Inspect Editor Tokens and Scopes"

To publish a new version:

```
npm run publish
```

[diagnostics-docs]: https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics
[sample-extension]: https://github.com/gbuktenica/Unicode-Substitutions
