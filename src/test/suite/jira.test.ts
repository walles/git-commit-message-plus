import * as assert from "assert";

import * as vscode from "vscode";
import * as jira from "../../jira";
import * as utils from "../../utils";
import { assertEditAction, createTextDocument } from "./common";

suite("JIRA Prefix Warnings", () => {
  test("[Jira-123] JIRA issue ID capitalization", () => {
    const expected = utils.createDiagnostic(
      0,
      1,
      9,
      `JIRA issue ID should be in CAPS: JIRA-123`,
      vscode.DiagnosticSeverity.Warning,
      {
        target: jira._private.jiraCapsUrl,
        value: "JIRA issue ID format",
      }
    );

    assert.deepStrictEqual(
      jira._private.getJiraCapsDiagnostic("[Jira-123] Hello"),
      [expected]
    );
  });

  test("jira-123: JIRA issue ID capitalization", () => {
    const expected = utils.createDiagnostic(
      0,
      0,
      8,
      `JIRA issue ID should be in CAPS: JIRA-123`,
      vscode.DiagnosticSeverity.Warning,
      {
        target: jira._private.jiraCapsUrl,
        value: "JIRA issue ID format",
      }
    );

    assert.deepStrictEqual(
      jira._private.getJiraCapsDiagnostic("jira-123: Hello"),
      [expected]
    );
  });

  test("JIRA-123: But the branch has JIRA-234", () => {
    const expected = utils.createDiagnostic(
      0,
      0,
      8,
      `JIRA issue ID should match the branch name: JIRA-234`,
      vscode.DiagnosticSeverity.Error,
      undefined
    );

    assert.deepStrictEqual(
      jira._private.getJiraBranchIdMismatchDiagnostic(
        "jira-234",
        "JIRA-123: But the branch has JIRA-234"
      ),
      [expected]
    );
  });

  test("JIRA-123: No branch issue ID", () => {
    assert.deepStrictEqual(
      jira._private.getJiraBranchIdMismatchDiagnostic(
        "holly-molly-polly",
        "JIRA-123: No branch issue ID"
      ),
      []
    );
  });
});

suite("Quick Fix", () => {
  test("[jira-123] Should be capsed", async () => {
    const doc = await createTextDocument(["[jira-123] Should be capsed"]);
    const actual = jira._private.createUpcaseJiraIdFix(
      doc,
      utils.createRange(0, 5, 5)
    );

    // FIXME: Verify the code action points back to the right diagnostic

    await assertEditAction(actual, "Convert JIRA issue ID to CAPS", doc, [
      "[JIRA-123] Should be capsed",
    ]);
  });

  test("jira-123: Should be capsed", async () => {
    const doc = await createTextDocument(["jira-123: Should be capsed"]);
    const actual = jira._private.createUpcaseJiraIdFix(
      doc,
      utils.createRange(0, 5, 5)
    );

    // FIXME: Verify the code action points back to the right diagnostic

    await assertEditAction(actual, "Convert JIRA issue ID to CAPS", doc, [
      "JIRA-123: Should be capsed",
    ]);
  });

  test("JIRA-123: Should match branch issue ID", async () => {
    const doc = await createTextDocument([
      "JIRA-123: Should match branch issue ID",
    ]);
    const actual = jira._private.createBranchIssueIdFix(
      "jira-234",
      doc,
      utils.createRange(0, 5, 5)
    );

    // FIXME: Verify the code action points back to the right diagnostic

    await assertEditAction(actual, "Set issue ID from branch: JIRA-234", doc, [
      "JIRA-234: Should match branch issue ID",
    ]);
  });

  test("JIRA-234: Already matching the branch issue ID", async () => {
    const doc = await createTextDocument([
      "JIRA-234: Should match branch issue ID",
    ]);
    const actual = jira._private.createBranchIssueIdFix(
      "jira-234",
      doc,
      utils.createRange(0, 5, 5)
    );

    // Nothing to change
    assert.deepEqual(actual, []);
  });

  test("[JIRA-123] Should match branch issue ID", async () => {
    const doc = await createTextDocument([
      "[JIRA-123] Should match branch issue ID",
    ]);
    const actual = jira._private.createBranchIssueIdFix(
      "jira-234",
      doc,
      utils.createRange(0, 5, 5)
    );

    // FIXME: Verify the code action points back to the right diagnostic

    await assertEditAction(actual, "Set issue ID from branch: JIRA-234", doc, [
      "[JIRA-234] Should match branch issue ID",
    ]);
  });

  test("[JIRA-123] No branch issue ID", async () => {
    const doc = await createTextDocument(["[JIRA-123] No branch issue ID"]);
    const actual = jira._private.createBranchIssueIdFix(
      "tom-dick-and-harry",
      doc,
      utils.createRange(0, 5, 5)
    );

    assert.deepEqual(actual, []);
  });

  test("[JIRA-234] Already matching the branch issue ID", async () => {
    const doc = await createTextDocument([
      "[JIRA-234] Should match branch issue ID",
    ]);
    const actual = jira._private.createBranchIssueIdFix(
      "jira-234",
      doc,
      utils.createRange(0, 5, 5)
    );

    // Nothing to change
    assert.deepEqual(actual, []);
  });

  test("[jira-234] Matching branch but wrong case", async () => {
    const doc = await createTextDocument([
      "[jira-234] Matching branch but wrong case",
    ]);
    const actual = jira._private.createBranchIssueIdFix(
      "jira-234",
      doc,
      utils.createRange(0, 5, 5)
    );

    // Nothing to change, let createUpcaseJiraIdFix() take care of this case
    assert.deepEqual(actual, []);
  });
});
