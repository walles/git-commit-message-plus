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

suite("Git Commit Message Plus", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Empty Text Document", () => {
    const empty = new FakeTextDocument([]);
    assert.deepStrictEqual(extension._private.getDiagnostics(empty), []);
  });

  test("First line 50 chars", () => {
    assert.deepStrictEqual(
      extension._private.getFirstLine50Diagnostic("x".repeat(50)),
      []
    );
  });

  test("First line 51 chars", () => {
    const expected = extension._private.diag(
      0,
      50,
      72, // We let VSCode do the clipping here, so 72 is expected rather than 51
      `Try keeping the subject line to at most 50 characters`,
      vscode.DiagnosticSeverity.Information,
      extension._private.subjectLineLengthUrl,
      "Subject Line Length"
    );

    assert.deepStrictEqual(
      extension._private.getFirstLine50Diagnostic("x".repeat(51)),
      [expected]
    );
  });

  test("First line 72 chars", () => {
    assert.deepStrictEqual(
      extension._private.getFirstLine72Diagnostic("x".repeat(72)),
      []
    );
  });

  test("First line 73 chars", () => {
    const expected = extension._private.diag(
      0,
      72,
      73,
      `Keep the subject line to at most 72 characters`,
      vscode.DiagnosticSeverity.Warning,
      extension._private.subjectLineLengthUrl,
      "Subject Line Length"
    );

    assert.deepStrictEqual(
      extension._private.getFirstLine72Diagnostic("x".repeat(73)),
      [expected]
    );
  });

  test('First line ending in "."', () => {
    const expected = extension._private.diag(
      0,
      5,
      6,
      `Do not end the subject line with a period`,
      vscode.DiagnosticSeverity.Error,
      extension._private.subjectLinePunctuationUrl,
      "Subject Line Punctuation"
    );

    assert.deepStrictEqual(
      extension._private.getFirstLinePunctuationDiagnostic("Hello."),
      [expected]
    );
  });

  test('First line ending in "..."', () => {
    const expected = extension._private.diag(
      0,
      5,
      8,
      `Do not end the subject line with an ellipsis`,
      vscode.DiagnosticSeverity.Error,
      extension._private.subjectLinePunctuationUrl,
      "Subject Line Punctuation"
    );

    assert.deepStrictEqual(
      extension._private.getFirstLinePunctuationDiagnostic("Hello..."),
      [expected]
    );
  });

  test('First line ending in "!"', () => {
    const expected = extension._private.diag(
      0,
      5,
      6,
      `Do not end the subject line with an exclamation mark`,
      vscode.DiagnosticSeverity.Error,
      extension._private.subjectLinePunctuationUrl,
      "Subject Line Punctuation"
    );

    assert.deepStrictEqual(
      extension._private.getFirstLinePunctuationDiagnostic("Hello!"),
      [expected]
    );
  });

  test("Empty second line", () => {
    assert.deepStrictEqual(extension._private.getSecondLineDiagnostic(""), []);
  });

  test("Comment on second line", () => {
    assert.deepStrictEqual(
      extension._private.getSecondLineDiagnostic(
        "# This line is commented out"
      ),
      []
    );
  });

  test("Not-comment on second line", () => {
    const expected = extension._private.diag(
      1,
      0,
      5,
      `Leave the second line blank`,
      vscode.DiagnosticSeverity.Error,
      extension._private.secondLineBlankUrl,
      "Blank Second Line"
    );

    assert.deepStrictEqual(
      extension._private.getSecondLineDiagnostic("Hello"),
      [expected]
    );
  });
});
