import * as assert from "assert";

import * as vscode from "vscode";
import * as extension from "../../extension";
import * as jira from "../../jira";

suite("Git Commit Message Plus", () => {
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
      extension._private.getFirstLineCapsDiagnostic("[Jira-123] Hello"),
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
      extension._private.getFirstLineCapsDiagnostic("jira-123: Hello"),
      [expected]
    );
  });
});
