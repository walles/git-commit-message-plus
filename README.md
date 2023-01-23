# Git Commit Message Plus

A git commit message highlighter that should be nicer than the built-in one.

## Features

- Comes with tests using <https://github.com/PanAeon/vscode-tmgrammar-test>
- Proper `git commit -v` diff highlighting even when running `git` in
  not-English.
- TODO: Tests are runnable using `npm test`
- TODO: Mark too long subject lines as errors with hover help and stuff.
- TODO: No highlighting of too-long subject lines, leave that to the error
  reporting ^.
- TODO: Mark trailing punctuation as an error with hover help and stuff.
- TODO: Mark any second-line text as an error with hover help and stuff.
- TODO: Mark commit message subject line in bold, it _is_ a heading after all.

FIXME: Add an animated demo here!

\!\[feature X\]\(images/feature-x.png\)

## Development

To run the unit tests:

```
npm install
./node_modules/.bin/vscode-tmgrammar-test -g tests/support/diff.tmLanguage.json tests/unit/*.test
```

To install into VSCode:

1. `npm package`
1. In VSCode:
   - Click Extensions
   - Click the ... menu in the top right corner
   - Click Install from VSIX...
