import * as vscode from "vscode";

const preferSubjectLineLength = 50;
const maxSubjectLineLength = 72;
const subjectLineLengthUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#limit-50"
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
  }

  return returnMe;
}

function getFirstLine50Diagnostic(firstLine: string): vscode.Diagnostic[] {
  if (firstLine.length <= preferSubjectLineLength) {
    return [];
  }

  const range = new vscode.Range(
    new vscode.Position(0, preferSubjectLineLength),
    new vscode.Position(0, maxSubjectLineLength)
  );

  const diagnostic = new vscode.Diagnostic(
    range,
    `Try keeping the subject line to at most ${preferSubjectLineLength} characters`,
    vscode.DiagnosticSeverity.Information
  );
  diagnostic.code = {
    target: subjectLineLengthUrl,
    value: "Subject Line Length",
  };

  return [diagnostic];
}

function getFirstLine72Diagnostic(firstLine: string): vscode.Diagnostic[] {
  if (firstLine.length <= maxSubjectLineLength) {
    return [];
  }

  const range = new vscode.Range(
    new vscode.Position(0, maxSubjectLineLength),
    new vscode.Position(0, firstLine.length)
  );

  const diagnostic = new vscode.Diagnostic(
    range,
    `Keep the subject line to at most ${maxSubjectLineLength} characters`,
    vscode.DiagnosticSeverity.Warning
  );
  diagnostic.code = {
    target: subjectLineLengthUrl,
    value: "Subject Line Length",
  };

  return [diagnostic];
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  getDiagnostics,
  getFirstLine50Diagnostic,
  getFirstLine72Diagnostic,
  maxSubjectLineLengthUrl: subjectLineLengthUrl,
};
