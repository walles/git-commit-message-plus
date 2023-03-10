import * as assert from "assert";
import { createTextDocument } from "./common";

import * as vscode from "vscode";
import * as diagnostics from "../../diagnostics";
import * as utils from "../../utils";

suite("Git Commit Message Plus", () => {
  test("Empty Commit Message", async () => {
    const empty = await createTextDocument([]);
    assert.deepStrictEqual(diagnostics._private.getDiagnostics(empty), []);
  });

  test("Subject but no metadata", async () => {
    const subjectOnly = await createTextDocument(["Subject line"]);
    assert.deepStrictEqual(
      diagnostics._private.getDiagnostics(subjectOnly),
      []
    );
  });

  test("Good Commit Message", async () => {
    const message = await createTextDocument([
      "Fnord the Blorgs before releasing them",
      "",
      "Before this change, the splurgs sometimes died and had to be zonkered by",
      "the Guardians.",
    ]);
    assert.deepStrictEqual(diagnostics._private.getDiagnostics(message), []);
  });

  test("First line 50 chars", () => {
    assert.deepStrictEqual(
      diagnostics._private.getFirstLine50Diagnostic("x".repeat(50)),
      []
    );
  });

  test("First line 51 chars", () => {
    const expected = utils.createDiagnostic(
      0,
      50,
      72, // We let VSCode do the clipping here, so 72 is expected rather than 51
      `Try keeping the subject line to at most 50 characters`,
      vscode.DiagnosticSeverity.Warning,
      {
        target: diagnostics._private.subjectLineLengthUrl,
        value: "Subject Line Length",
      }
    );

    assert.deepStrictEqual(
      diagnostics._private.getFirstLine50Diagnostic("x".repeat(51)),
      [expected]
    );
  });

  test("First line 72 chars", () => {
    assert.deepStrictEqual(
      diagnostics._private.getFirstLine72Diagnostic("x".repeat(72)),
      []
    );
  });

  test("First line 73 chars", () => {
    const expected = utils.createDiagnostic(
      0,
      72,
      73,
      `Keep the subject line to at most 72 characters`,
      vscode.DiagnosticSeverity.Error,
      {
        target: diagnostics._private.subjectLineLengthUrl,
        value: "Subject Line Length",
      }
    );

    assert.deepStrictEqual(
      diagnostics._private.getFirstLine72Diagnostic("x".repeat(73)),
      [expected]
    );
  });

  test('First line ending in "."', () => {
    const expected = utils.createDiagnostic(
      0,
      5,
      6,
      `Do not end the subject line with a period`,
      vscode.DiagnosticSeverity.Error,
      {
        target: diagnostics._private.subjectLinePunctuationUrl,
        value: "Subject Line Punctuation",
      }
    );

    assert.deepStrictEqual(
      diagnostics._private.getFirstLinePunctuationDiagnostic("Hello."),
      [expected]
    );
  });

  test('First line ending in "..."', () => {
    const expected = utils.createDiagnostic(
      0,
      5,
      8,
      `Do not end the subject line with an ellipsis`,
      vscode.DiagnosticSeverity.Error,
      {
        target: diagnostics._private.subjectLinePunctuationUrl,
        value: "Subject Line Punctuation",
      }
    );

    assert.deepStrictEqual(
      diagnostics._private.getFirstLinePunctuationDiagnostic("Hello..."),
      [expected]
    );
  });

  test('First line ending in "!"', () => {
    const expected = utils.createDiagnostic(
      0,
      5,
      6,
      `Do not end the subject line with an exclamation mark`,
      vscode.DiagnosticSeverity.Error,
      {
        target: diagnostics._private.subjectLinePunctuationUrl,
        value: "Subject Line Punctuation",
      }
    );

    assert.deepStrictEqual(
      diagnostics._private.getFirstLinePunctuationDiagnostic("Hello!"),
      [expected]
    );
  });

  test("First line not capitalized", () => {
    const expected = utils.createDiagnostic(
      0,
      0,
      1,
      `First line should start with a Capital Letter`,
      vscode.DiagnosticSeverity.Error,
      {
        target: diagnostics._private.subjectLineCapitalizationUrl,
        value: "Subject Line Capitalization",
      }
    );

    assert.deepStrictEqual(
      diagnostics._private.getFirstLineCapsDiagnostic("hello"),
      [expected]
    );
  });

  test("[JIRA-123] First line not capitalized", () => {
    const expected = utils.createDiagnostic(
      0,
      11,
      12,
      `First line should start with a Capital Letter`,
      vscode.DiagnosticSeverity.Error,
      {
        target: diagnostics._private.subjectLineCapitalizationUrl,
        value: "Subject Line Capitalization",
      }
    );

    assert.deepStrictEqual(
      diagnostics._private.getFirstLineCapsDiagnostic(
        "[JIRA-123] first line not capitalized"
      ),
      [expected]
    );
  });

  test("jira-123: First line not capitalized", () => {
    const expected = utils.createDiagnostic(
      0,
      10,
      11,
      `First line should start with a Capital Letter`,
      vscode.DiagnosticSeverity.Error,
      {
        target: diagnostics._private.subjectLineCapitalizationUrl,
        value: "Subject Line Capitalization",
      }
    );

    assert.deepStrictEqual(
      diagnostics._private.getFirstLineCapsDiagnostic(
        "jira-123: first line not capitalized"
      ),
      [expected]
    );
  });

  test("Empty second line", () => {
    assert.deepStrictEqual(
      diagnostics._private.getSecondLineDiagnostic(""),
      []
    );
  });

  test("Comment on second line", () => {
    assert.deepStrictEqual(
      diagnostics._private.getSecondLineDiagnostic(
        "# This line is commented out"
      ),
      []
    );
  });

  test("Not-comment on second line", () => {
    const expected = utils.createDiagnostic(
      1,
      0,
      5,
      `Leave the second line blank`,
      vscode.DiagnosticSeverity.Error,
      {
        target: diagnostics._private.secondLineBlankUrl,
        value: "Blank Second Line",
      }
    );

    assert.deepStrictEqual(
      diagnostics._private.getSecondLineDiagnostic("Hello"),
      [expected]
    );
  });

  test("No diff", async () => {
    const withoutDiff = await createTextDocument([
      "Fnord the Blorgs before releasing them",
      "# Git: bla bla",
      "",
    ]);

    const expected = utils.createDiagnostic(
      2,
      0,
      withoutDiff.lineAt(2).text.length,
      "Use `git commit -v` to see diffs here",
      vscode.DiagnosticSeverity.Information,
      undefined
    );

    assert.deepStrictEqual(
      diagnostics._private.getNoDiffDiagnostic(withoutDiff),
      [expected]
    );
  });
});
