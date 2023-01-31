import * as assert from "assert";
import { FakeTextDocument } from "./common";

import * as vscode from "vscode";
import * as quickfix from "../../quickfix";
import * as utils from "../../utils";

suite("Quick Fix", () => {
  vscode.window.showInformationMessage("Start all tests.");

  suite("Capitalize subject line", () => {
    test("Simple example", () => {
      const doc = new FakeTextDocument(["this subject has initial lower case"]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 0, 0)
      );
      assert.equal(actual[0].title, "Capitalize subject line");

      // FIXME: Verify the code action points back to the right diagnostic

      // FIXME: Actually execute the code action and check that it did the right
      // thing
    });

    test("On second character", () => {
      const doc = new FakeTextDocument(["this subject has initial lower case"]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 1, 1)
      );
      assert.equal(actual[0].title, "Capitalize subject line");
    });

    test("Selection of first to second character", () => {
      const doc = new FakeTextDocument(["this subject has initial lower case"]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 0, 1)
      );
      assert.equal(actual[0].title, "Capitalize subject line");
    });

    test("On third character", () => {
      const doc = new FakeTextDocument(["this subject has initial lower case"]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 2, 2)
      );
      assert.deepEqual(actual, []);
    });

    test("Selection of first to third character", () => {
      const doc = new FakeTextDocument(["this subject has initial lower case"]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 0, 2)
      );
      assert.deepEqual(actual, []);
    });
  });

  suite("Remove trailing punctuation", () => {
    test("Left of the punctuation", () => {
      const doc = new FakeTextDocument([
        "This subject has trailing punctuation.",
      ]);
      const actual = quickfix._private.createRemoveTrailingPunctuationFix(
        doc,
        utils.createRange(0, 37, 37)
      );
      assert.equal(actual[0].title, "Remove trailing punctuation");

      // FIXME: Verify the code action points back to the right diagnostic

      // FIXME: Actually execute the code action and check that it did the right
      // thing
    });

    test("Right of the punctuation", () => {
      const doc = new FakeTextDocument([
        "This subject has trailing punctuation.",
      ]);
      const actual = quickfix._private.createRemoveTrailingPunctuationFix(
        doc,
        utils.createRange(0, 38, 38)
      );
      assert.equal(actual[0].title, "Remove trailing punctuation");
    });

    test("Not touching the punctuation", () => {
      const doc = new FakeTextDocument([
        "This subject has trailing punctuation.",
      ]);
      const actual = quickfix._private.createRemoveTrailingPunctuationFix(
        doc,
        utils.createRange(0, 36, 36)
      );
      assert.deepEqual(actual, []);
    });

    // FIXME: Figure out how to actually run a code action. Then try it on
    // different lines to see how it holds up.
  });
});
