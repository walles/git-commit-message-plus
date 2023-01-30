import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as extension from "../../extension";

class FakeTextDocument implements vscode.TextDocument {
  private lines: string[];

  uri: vscode.Uri;
  fileName: string;
  isUntitled: boolean;
  languageId: string;
  version: number;
  isDirty: boolean;
  isClosed: boolean;
  eol: vscode.EndOfLine;
  lineCount: number;

  lineAt(line: number | vscode.Position): vscode.TextLine {
    const lineNumber = line as number;
    const text = this.lines[lineNumber];
    return new FakeTextLine(lineNumber, text);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  offsetAt(position: vscode.Position): number {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  positionAt(offset: number): vscode.Position {
    throw new Error("Method not implemented.");
  }
  save(): Thenable<boolean> {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getText(range?: vscode.Range | undefined): string {
    throw new Error("Method not implemented.");
  }
  getWordRangeAtPosition(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    position: vscode.Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    regex?: RegExp | undefined
  ): vscode.Range | undefined {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateRange(range: vscode.Range): vscode.Range {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validatePosition(position: vscode.Position): vscode.Position {
    throw new Error("Method not implemented.");
  }

  constructor(lines: string[]) {
    this.lines = lines;
    this.lineCount = lines.length;

    // NOTE: Only dummy data below this point, improve as needed
    this.uri = vscode.Uri.parse("file:///invalid-placeholder", false);
    this.fileName = "invalid-placeholder";
    this.isUntitled = false;
    this.languageId = "invalid-placeholder";
    this.version = 1;
    this.isDirty = false;
    this.isClosed = false;
    this.eol = vscode.EndOfLine.LF;
  }
}

class FakeTextLine implements vscode.TextLine {
  lineNumber: number;
  text: string;
  range: vscode.Range;
  rangeIncludingLineBreak: vscode.Range;
  firstNonWhitespaceCharacterIndex: number;
  isEmptyOrWhitespace: boolean;

  constructor(lineNumber: number, line: string) {
    this.lineNumber = lineNumber;
    this.text = line;
    this.isEmptyOrWhitespace = line.trim().length == 0;

    // NOTE: Only dummy data below this point, improve as needed
    const dummyPosition = new vscode.Position(lineNumber, 0);
    const dummyRange = new vscode.Range(dummyPosition, dummyPosition);

    this.range = dummyRange;
    this.rangeIncludingLineBreak = dummyRange;
    this.firstNonWhitespaceCharacterIndex = 0;
  }
}

suite("Git Commit Message Plus", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Empty Commit Message", () => {
    const empty = new FakeTextDocument([]);
    assert.deepStrictEqual(extension._private.getDiagnostics(empty), []);
  });

  test("Subject but no metadata", () => {
    const subjectOnly = new FakeTextDocument(["Subject line"]);
    assert.deepStrictEqual(extension._private.getDiagnostics(subjectOnly), []);
  });

  test("Good Commit Message", () => {
    const message = new FakeTextDocument([
      "Fnord the Blorgs before releasing them",
      "",
      "Before this change, the splurgs sometimes died and had to be zonkered by",
      "the Guardians.",
    ]);
    assert.deepStrictEqual(extension._private.getDiagnostics(message), []);
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
      vscode.DiagnosticSeverity.Warning,
      {
        target: extension._private.subjectLineLengthUrl,
        value: "Subject Line Length",
      }
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
      vscode.DiagnosticSeverity.Error,
      {
        target: extension._private.subjectLineLengthUrl,
        value: "Subject Line Length",
      }
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
      {
        target: extension._private.subjectLinePunctuationUrl,
        value: "Subject Line Punctuation",
      }
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
      {
        target: extension._private.subjectLinePunctuationUrl,
        value: "Subject Line Punctuation",
      }
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
      {
        target: extension._private.subjectLinePunctuationUrl,
        value: "Subject Line Punctuation",
      }
    );

    assert.deepStrictEqual(
      extension._private.getFirstLinePunctuationDiagnostic("Hello!"),
      [expected]
    );
  });

  test("First line not capitalized", () => {
    const expected = extension._private.diag(
      0,
      0,
      1,
      `First line should start with a Capital Letter`,
      vscode.DiagnosticSeverity.Error,
      {
        target: extension._private.subjectLineCapitalizationUrl,
        value: "Subject Line Capitalization",
      }
    );

    assert.deepStrictEqual(
      extension._private.getFirstLineCapsDiagnostic("hello"),
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
      {
        target: extension._private.secondLineBlankUrl,
        value: "Blank Second Line",
      }
    );

    assert.deepStrictEqual(
      extension._private.getSecondLineDiagnostic("Hello"),
      [expected]
    );
  });

  test("No diff", () => {
    const withoutDiff = new FakeTextDocument([
      "Fnord the Blorgs before releasing them",
      "# Git: bla bla",
      "",
    ]);

    const expected = extension._private.diag(
      1,
      0,
      withoutDiff.lineAt(1).text.length,
      "Run `git commit -v` to see diffs below this line",
      vscode.DiagnosticSeverity.Information,
      undefined
    );

    assert.deepStrictEqual(
      extension._private.getNoDiffDiagnostic(withoutDiff),
      [expected]
    );
  });
});
