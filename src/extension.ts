import * as vscode from "vscode";

const preferSubjectLineLength = 50;
const maxSubjectLineLength = 72;
const subjectLineLengthUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#limit-50"
);
const subjectLinePunctuationUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#end"
);

/** Subset of vscode.TextLine, for simplifying test writing. */
export interface TextLineLite {
  text: string;
}

/** Subset of vscode.TextDocument, for simplifying test writing. */
export interface TextDocumentLite {
  lineCount: number;
  lineAt(line: number): TextLineLite;
}

let diagnosticCollection: vscode.DiagnosticCollection;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("Git Commit Message Plus says hello!");

  diagnosticCollection =
    vscode.languages.createDiagnosticCollection("git-commit-message");
  context.subscriptions.push(diagnosticCollection);

  const documentChangeListener = vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const doc = event.document;
      if (doc.languageId !== "git-commit") {
        return;
      }

      diagnosticCollection.set(doc.uri, getDiagnostics(doc));
    },
    null,
    context.subscriptions
  );
  context.subscriptions.push(documentChangeListener);

  // FIXME: Make sure linting is triggered when we open a commit message, not
  // just when it changes. I tried to react to onDidOpenTextDocument(), but
  // documents seem to default to plain-text when loaded so that didn't work.
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Git Commit Message Plus says good bye!");
}

function getDiagnostics(doc: TextDocumentLite): vscode.Diagnostic[] {
  const returnMe: vscode.Diagnostic[] = [];

  if (doc.lineCount >= 1) {
    const firstLine = doc.lineAt(0).text;
    returnMe.push(...getFirstLine50Diagnostic(firstLine));
    returnMe.push(...getFirstLine72Diagnostic(firstLine));
    returnMe.push(...getFirstLinePunctuationDiagnostic(firstLine));
  }

  return returnMe;
}

function diag(
  line: number,
  columnStart: number,
  columnEnd: number,
  message: string,
  severity: vscode.DiagnosticSeverity,
  target: vscode.Uri,
  value: string
): vscode.Diagnostic {
  const range = new vscode.Range(
    new vscode.Position(line, columnStart),
    new vscode.Position(line, columnEnd)
  );
  const returnMe = new vscode.Diagnostic(range, message, severity);
  returnMe.code = {
    target: target,
    value: value,
  };
  return returnMe;
}

function getFirstLine50Diagnostic(firstLine: string): vscode.Diagnostic[] {
  if (firstLine.length <= preferSubjectLineLength) {
    return [];
  }

  return [
    diag(
      0,
      preferSubjectLineLength,
      maxSubjectLineLength,
      `Try keeping the subject line to at most ${preferSubjectLineLength} characters`,
      vscode.DiagnosticSeverity.Information,
      subjectLineLengthUrl,
      "Subject Line Length"
    ),
  ];
}

function getFirstLine72Diagnostic(firstLine: string): vscode.Diagnostic[] {
  if (firstLine.length <= maxSubjectLineLength) {
    return [];
  }

  return [
    diag(
      0,
      maxSubjectLineLength,
      firstLine.length,
      `Keep the subject line to at most ${maxSubjectLineLength} characters`,
      vscode.DiagnosticSeverity.Warning,
      subjectLineLengthUrl,
      "Subject Line Length"
    ),
  ];
}

function getFirstLinePunctuationDiagnostic(
  firstLine: string
): vscode.Diagnostic[] {
  if (firstLine.length >= 3 && firstLine.endsWith("...")) {
    return [
      diag(
        0,
        firstLine.length - 3,
        firstLine.length,
        "Do not end the subject line with an ellipsis",
        vscode.DiagnosticSeverity.Error,
        subjectLinePunctuationUrl,
        "Subject Line Punctuation"
      ),
    ];
  }

  if (firstLine.length >= 1 && firstLine.endsWith(".")) {
    return [
      diag(
        0,
        firstLine.length - 1,
        firstLine.length,
        "Do not end the subject line with a period",
        vscode.DiagnosticSeverity.Error,
        subjectLinePunctuationUrl,
        "Subject Line Punctuation"
      ),
    ];
  }

  if (firstLine.length >= 1 && firstLine.endsWith("!")) {
    return [
      diag(
        0,
        firstLine.length - 1,
        firstLine.length,
        "Do not end the subject line with an exclamation mark",
        vscode.DiagnosticSeverity.Error,
        subjectLinePunctuationUrl,
        "Subject Line Punctuation"
      ),
    ];
  }

  return [];
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  diag,
  getDiagnostics,
  getFirstLine50Diagnostic,
  getFirstLine72Diagnostic,
  getFirstLinePunctuationDiagnostic,
  subjectLineLengthUrl,
  subjectLinePunctuationUrl,
};
