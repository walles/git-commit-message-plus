import * as assert from "assert";

import * as vscode from "vscode";
import * as jira from "../../jira";
import * as utils from "../../utils";

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
});
