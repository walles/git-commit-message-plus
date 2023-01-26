import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as extension from "../../extension";

class FakeTextDocument implements extension.TextDocumentLite {
  private readonly lines: string[];
  readonly lineCount: number;

  constructor(lines: string[]) {
    this.lines = lines;
    this.lineCount = lines.length;
  }

  lineAt(line: number): extension.TextLineLite {
    return { text: this.lines[line] };
  }
}

function diag(
  line: number,
  columnStart: number,
  columnEnd: number,
  message: string,
  severity: vscode.DiagnosticSeverity
): vscode.Diagnostic {
  const range = new vscode.Range(
    new vscode.Position(line, columnStart),
    new vscode.Position(line, columnEnd)
  );
  const returnMe = new vscode.Diagnostic(range, message, severity);
  returnMe.code = {
    target: extension._private.maxSubjectLineLengthUrl,
    value: "Subject Line Length",
  };
  return returnMe;
}

suite("Git Commit Message Plus", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Empty Text Document", () => {
    const empty = new FakeTextDocument([]);
    assert.deepStrictEqual(extension._private.getDiagnostics(empty), []);
  });

  test("First line 50 chars", () => {
    const doc = new FakeTextDocument(["x".repeat(50)]);
    assert.deepStrictEqual(extension._private.getDiagnostics(doc), []);
  });

  test("First line 51 chars", () => {
    const doc = new FakeTextDocument(["x".repeat(51)]);

    const expected = diag(
      0,
      50,
      51,
      `Try keeping the subject line to at most 50 characters`,
      vscode.DiagnosticSeverity.Information
    );

    assert.deepStrictEqual(extension._private.getDiagnostics(doc), [expected]);
  });

  test("First line 72 chars", () => {
    const doc = new FakeTextDocument(["x".repeat(72)]);

    const expected = diag(
      0,
      50,
      72,
      `Try keeping the subject line to at most 50 characters`,
      vscode.DiagnosticSeverity.Information
    );

    assert.deepStrictEqual(extension._private.getDiagnostics(doc), [expected]);
  });

  test("First line 73 chars", () => {
    const doc = new FakeTextDocument(["x".repeat(73)]);

    const expected = [
      diag(
        0,
        50,
        72,
        `Try keeping the subject line to at most 50 characters`,
        vscode.DiagnosticSeverity.Information
      ),
      diag(
        0,
        72,
        73,
        `Keep the subject line to at most 72 characters`,
        vscode.DiagnosticSeverity.Warning
      ),
    ];

    assert.deepStrictEqual(extension._private.getDiagnostics(doc), expected);
  });
});
