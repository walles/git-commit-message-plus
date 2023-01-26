// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

const maxSubjectLineLength = 72;
const maxSubjectLineLengthUrl = vscode.Uri.parse(
  "https://www.gitkraken.com/learn/git/best-practices/git-commit-message"
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
  if (doc.lineCount < 1) {
    return [];
  }

  const returnMe: vscode.Diagnostic[] = [];

  const firstLine = doc.lineAt(0).text;
  if (firstLine.length > maxSubjectLineLength) {
    const range = new vscode.Range(
      new vscode.Position(0, 72),
      new vscode.Position(0, firstLine.length)
    );

    const diagnostic = new vscode.Diagnostic(
      range,
      `Keep the subject line to at most ${maxSubjectLineLength} characters`,
      vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = {
      target: maxSubjectLineLengthUrl,
      value: "Git Commit Message Structure",
    };

    returnMe.push(diagnostic);
  }

  return returnMe;
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  getDiagnostics,
  maxSubjectLineLengthUrl,
};
