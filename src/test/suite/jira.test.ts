import * as assert from "assert";

import * as vscode from "vscode";
import * as jira from "../../jira";
import * as utils from "../../utils";

suite("Git Commit Message Plus", () => {
  test("Find issue ID", () => {
    assert.deepStrictEqual(jira._private.findIssueId("[Jira-123] Hello"), {
      startIndex: 1,
      firstIndexAfter: 11,
      id: "Jira-123",
    });

    assert.deepStrictEqual(jira._private.findIssueId("jira-123: Hello"), {
      startIndex: 0,
      firstIndexAfter: 10,
      id: "jira-123",
    });

    assert.deepStrictEqual(jira._private.findIssueId("Hello"), {
      startIndex: 0,
      firstIndexAfter: 0,
      id: "",
    });
  });

  test("[Jira-123] JIRA issue ID capitalization", () => {
    const expected = utils.createDiagnostic(
      0,
      1,
      9,
      `JIRA issue ID should be in ALL CAPS: JIRA-123`,
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
      `JIRA issue ID should be in ALL CAPS: JIRA-123`,
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
