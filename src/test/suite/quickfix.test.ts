import * as assert from "assert";
import { createTextDocument } from "./common";

import * as vscode from "vscode";
import * as quickfix from "../../quickfix";
import * as utils from "../../utils";

suite("Quick Fix", () => {
  vscode.window.showInformationMessage("Start all tests.");

  suite("Capitalize subject line", () => {
    test("Simple example", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 0, 0)
      );

      // FIXME: Verify the code action points back to the right diagnostic

      assertEditAction(actual, "Capitalize subject line", doc, [
        "This subject has initial lower case",
      ]);
    });

    test("On second character", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 1, 1)
      );

      assertEditAction(actual, "Capitalize subject line", doc, [
        "This subject has initial lower case",
      ]);
    });

    test("Selection of first to second character", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 0, 1)
      );

      assertEditAction(actual, "Capitalize subject line", doc, [
        "This subject has initial lower case",
      ]);
    });

    test("On third character", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 2, 2)
      );
      assert.deepEqual(actual, []);
    });

    test("Selection of first to third character", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 0, 2)
      );
      assert.deepEqual(actual, []);
    });
  });

  suite("Remove trailing punctuation", () => {
    test("Left of the punctuation", async () => {
      const doc = await createTextDocument([
        "This subject has trailing punctuation.",
      ]);
      const actual = quickfix._private.createRemoveTrailingPunctuationFix(
        doc,
        utils.createRange(0, 37, 37)
      );

      // FIXME: Verify the code action points back to the right diagnostic

      assertEditAction(actual, "Remove trailing punctuation", doc, [
        "This subject has trailing punctuation",
      ]);
    });

    test("Right of the punctuation", async () => {
      const doc = await createTextDocument([
        "This subject has trailing punctuation.",
      ]);
      const actual = quickfix._private.createRemoveTrailingPunctuationFix(
        doc,
        utils.createRange(0, 38, 38)
      );

      assertEditAction(actual, "Remove trailing punctuation", doc, [
        "This subject has trailing punctuation",
      ]);
    });

    test("Not touching the punctuation", async () => {
      const doc = await createTextDocument([
        "This subject has trailing punctuation.",
      ]);
      const actual = quickfix._private.createRemoveTrailingPunctuationFix(
        doc,
        utils.createRange(0, 36, 36)
      );
      assert.deepEqual(actual, []);
    });
  });
});

/**
 * Assert we have exactly one code action, and that after applying it the doc
 * has the expected contents.
 */
async function assertEditAction(
  codeActions: vscode.CodeAction[],
  expectedTitle: string,
  doc: vscode.TextDocument,
  expectedLinesAfterApply: string[]
) {
  assert.equal(codeActions.length, 1);

  const action = codeActions[0];
  assert.equal(action.title, expectedTitle);

  // Apply the edit and verify the result
  if (action.edit == undefined) {
    assert.fail("Code action has no WorkspaceEdit");
  }

  await vscode.workspace.applyEdit(action.edit);

  const actualLines = [];
  for (let i = 0; i < doc.lineCount; i++) {
    actualLines.push(doc.lineAt(i).text);
  }
  assert.equal(actualLines, expectedLinesAfterApply);
}
