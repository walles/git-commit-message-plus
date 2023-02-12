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

  test("Get JIRA ticket from branch name", () => {
    assert.equal(jira._private.getJiraIssueIdFromBranchName(""), undefined);
    assert.equal(
      jira._private.getJiraIssueIdFromBranchName("jira-1234"),
      "JIRA-1234"
    );
    assert.equal(
      jira._private.getJiraIssueIdFromBranchName("Jira-1234-fluff"),
      "JIRA-1234"
    );
    assert.equal(
      jira._private.getJiraIssueIdFromBranchName("JIRA-1234/fluff"),
      "JIRA-1234"
    );
    assert.equal(
      jira._private.getJiraIssueIdFromBranchName("jira-1234.fluff"),
      "JIRA-1234"
    );
    assert.equal(
      jira._private.getJiraIssueIdFromBranchName("jira-1234fluff"),
      undefined
    );

    // Non-English chars not allowed:
    // https://confluence.atlassian.com/adminjiraserver/changing-the-project-key-format-938847081.html
    assert.equal(
      jira._private.getJiraIssueIdFromBranchName("jorå-1234.fluff"),
      undefined
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
});
