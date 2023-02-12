import * as assert from "assert";

import * as vscode from "vscode";
import * as extension from "../../extension";
import * as jira from "../../jira";

suite("Git Commit Message Plus", () => {
  test("Find issue ID", () => {
    assert.deepStrictEqual(jira._private.findIssueId("[Jira-123] Hello"), {
      startIndex: 1,
      firstIndexAfter: 11,
      issueId: "Jira-123",
    });

    assert.deepStrictEqual(jira._private.findIssueId("jira-123: Hello"), {
      startIndex: 0,
      firstIndexAfter: 10,
      issueId: "jira-123",
    });

    assert.equal(jira._private.findIssueId("Hello"), undefined);
  });

  test("[Jira-123] JIRA issue ID capitalization", () => {
    const expected = extension._private.createDiagnostic(
      0,
      1,
      5,
      `JIRA issue ID should be in ALL CAPS`,
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
    const expected = extension._private.createDiagnostic(
      0,
      0,
      4,
      `JIRA issue ID should be in ALL CAPS`,
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
});
