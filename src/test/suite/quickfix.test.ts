import * as assert from "assert";
import { FakeTextDocument } from "./common";

import * as vscode from "vscode";
import * as quickfix from "../../quickfix";
import * as utils from "../../utils";

suite("Quick Fix", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Simple example", () => {
    const doc = new FakeTextDocument(["this subject has initial lower case"]);
    const [fix] = quickfix._private.createUpcaseFirstSubjectCharFix(
      doc,
      utils.createRange(0, 0, 0)
    );
    assert.equal(fix.title, "Capitalize subject line");

    // FIXME: Verify the code action points back to the right diagnostic

    // FIXME: Actually execute the code action and check that it did the right
    // thing
  });

  test("On second character", () => {
    const doc = new FakeTextDocument(["this subject has initial lower case"]);
    const [fix] = quickfix._private.createUpcaseFirstSubjectCharFix(
      doc,
      utils.createRange(0, 1, 1)
    );
    assert.equal(fix.title, "Capitalize subject line");
  });

  test("Selection of first to second character", () => {
    const doc = new FakeTextDocument(["this subject has initial lower case"]);
    const [fix] = quickfix._private.createUpcaseFirstSubjectCharFix(
      doc,
      utils.createRange(0, 0, 1)
    );
    assert.equal(fix.title, "Capitalize subject line");
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
