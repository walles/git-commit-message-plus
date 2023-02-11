import * as vscode from "vscode";
import * as utils from "./utils";
import GitCommitCodeActionProvider from "./quickfix";

const preferSubjectLineLength = 50;
const maxSubjectLineLength = 72;
const subjectLineLengthUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#limit-50"
);
const subjectLinePunctuationUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#end"
);
const subjectLineCapitalizationUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#capitalize"
);
const secondLineBlankUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#separate"
);

let diagnosticCollection: vscode.DiagnosticCollection;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection =
    vscode.languages.createDiagnosticCollection("git-commit-message");
  context.subscriptions.push(diagnosticCollection);

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      "git-commit",
      new GitCommitCodeActionProvider(),
      {
        providedCodeActionKinds:
          GitCommitCodeActionProvider.providedCodeActionKinds,
      }
    )
  );

  const documentChangeListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      doLinting(event.document);
    },
    null,
    context.subscriptions
  );
  context.subscriptions.push(documentChangeListener);

  // Call the listeners on initilization for current active text editor
  //
  // Inspiration from here:
  // https://github.com/golang/vscode-go/blob/d28aeac9bb6d98e0c6fdcb74199144cdae31f311/src/goMain.ts
  if (vscode.window.activeTextEditor) {
    doLinting(vscode.window.activeTextEditor.document);
  }
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        doLinting(editor.document);
      }
    },
    null,
    context.subscriptions
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Git Commit Message Plus says good bye!");
}

function doLinting(doc: vscode.TextDocument) {
  if (doc.languageId !== "git-commit") {
    return;
  }

  diagnosticCollection.set(doc.uri, getDiagnostics(doc));
}

function getDiagnostics(doc: vscode.TextDocument): vscode.Diagnostic[] {
  const returnMe: vscode.Diagnostic[] = [];

  if (doc.lineCount >= 1) {
    const firstLine = doc.lineAt(0).text;
    returnMe.push(...getFirstLine50Diagnostic(firstLine));
    returnMe.push(...getFirstLine72Diagnostic(firstLine));
    returnMe.push(...getFirstLinePunctuationDiagnostic(firstLine));
    returnMe.push(...getFirstLineCapsDiagnostic(firstLine));
  }

  if (doc.lineCount >= 2) {
    const secondLine = doc.lineAt(1).text;
    returnMe.push(...getSecondLineDiagnostic(secondLine));
    returnMe.push(...getNoDiffDiagnostic(doc));
  }

  return returnMe;
}

function createDiagnostic(
  line: number,
  columnStart: number,
  columnEnd: number,
  message: string,
  severity: vscode.DiagnosticSeverity,
  code:
    | {
        value: string | number;
        target: vscode.Uri;
      }
    | undefined
): vscode.Diagnostic {
  const range = utils.createRange(line, columnStart, columnEnd);
  const returnMe = new vscode.Diagnostic(range, message, severity);
  returnMe.code = code;
  return returnMe;
}

function getFirstLine50Diagnostic(firstLine: string): vscode.Diagnostic[] {
  if (firstLine.length <= preferSubjectLineLength) {
    return [];
  }

  return [
    createDiagnostic(
      0,
      preferSubjectLineLength,
      maxSubjectLineLength,
      `Try keeping the subject line to at most ${preferSubjectLineLength} characters`,
      vscode.DiagnosticSeverity.Warning,
      {
        target: subjectLineLengthUrl,
        value: "Subject Line Length",
      }
    ),
  ];
}

function getFirstLine72Diagnostic(firstLine: string): vscode.Diagnostic[] {
  if (firstLine.length <= maxSubjectLineLength) {
    return [];
  }

  return [
    createDiagnostic(
      0,
      maxSubjectLineLength,
      firstLine.length,
      `Keep the subject line to at most ${maxSubjectLineLength} characters`,
      vscode.DiagnosticSeverity.Error,
      { target: subjectLineLengthUrl, value: "Subject Line Length" }
    ),
  ];
}

function getFirstLinePunctuationDiagnosticHelper(
  firstLine: string,
  badSuffix: string,
  suffixDescription: string
): vscode.Diagnostic | null {
  if (!firstLine.endsWith(badSuffix)) {
    return null;
  }

  return createDiagnostic(
    0,
    firstLine.length - badSuffix.length,
    firstLine.length,
    "Do not end the subject line with " + suffixDescription,
    vscode.DiagnosticSeverity.Error,
    { target: subjectLinePunctuationUrl, value: "Subject Line Punctuation" }
  );
}

function getFirstLinePunctuationDiagnostic(
  firstLine: string
): vscode.Diagnostic[] {
  const d =
    getFirstLinePunctuationDiagnosticHelper(firstLine, "...", "an ellipsis") ||
    getFirstLinePunctuationDiagnosticHelper(firstLine, ".", "a period") ||
    getFirstLinePunctuationDiagnosticHelper(
      firstLine,
      "!",
      "an exclamation mark"
    );
  if (d != null) {
    return [d];
  }
  return [];
}

function getFirstLineCapsDiagnostic(firstLine: string): vscode.Diagnostic[] {
  if (firstLine.length < 1) {
    return [];
  }

  const firstChar = firstLine.charAt(0);
  if (utils.isLower(firstChar)) {
    return [
      createDiagnostic(
        0,
        0,
        1,
        "First line should start with a Capital Letter",
        vscode.DiagnosticSeverity.Error,
        {
          target: subjectLineCapitalizationUrl,
          value: "Subject Line Capitalization",
        }
      ),
    ];
  }

  return [];
}

function getSecondLineDiagnostic(secondLine: string): vscode.Diagnostic[] {
  if (secondLine.length == 0) {
    return [];
  }

  if (secondLine.startsWith("#")) {
    return [];
  }

  return [
    createDiagnostic(
      1,
      0,
      secondLine.length,
      "Leave the second line blank",
      vscode.DiagnosticSeverity.Error,
      { target: secondLineBlankUrl, value: "Blank Second Line" }
    ),
  ];
}

function getNoDiffDiagnostic(doc: vscode.TextDocument): vscode.Diagnostic[] {
  if (doc.lineCount < 2) {
    return [];
  }

  let lastNonEmptyLineNumber = doc.lineCount - 1;
  let lastNonEmptyLine = doc.lineAt(lastNonEmptyLineNumber);
  if (lastNonEmptyLine.text.length == 0) {
    lastNonEmptyLineNumber = doc.lineCount - 2;
    lastNonEmptyLine = doc.lineAt(lastNonEmptyLineNumber);
  }

  if (!lastNonEmptyLine.text.startsWith("#")) {
    // Not a comment, probably a diff
    return [];
  }

  return [
    createDiagnostic(
      doc.lineCount - 1, // Place diagnostic on the last line
      0,
      doc.lineAt(doc.lineCount - 1).text.length,
      "Run `git commit -v` to see diffs here",
      vscode.DiagnosticSeverity.Information,
      undefined
    ),
  ];
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  createDiagnostic,
  getDiagnostics,
  getFirstLine50Diagnostic,
  getFirstLine72Diagnostic,
  getFirstLinePunctuationDiagnostic,
  getFirstLineCapsDiagnostic,
  getSecondLineDiagnostic,
  getNoDiffDiagnostic,
  subjectLineLengthUrl,
  subjectLinePunctuationUrl,
  subjectLineCapitalizationUrl,
  secondLineBlankUrl,
};
