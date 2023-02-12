import * as vscode from "vscode";
import * as utils from "./utils";

const jiraCapsUrl = vscode.Uri.parse(
  "https://confluence.atlassian.com/adminjiraserver/changing-the-project-key-format-938847081.html"
);

export default function getJiraDiagnostics(
  doc: vscode.TextDocument
): vscode.Diagnostic[] {
  if (doc.lineCount < 1) {
    return [];
  }

  const firstLine = doc.lineAt(0).text;
  const returnMe: vscode.Diagnostic[] = [];
  returnMe.push(...getJiraCapsDiagnostic(firstLine));

  // FIXME: Get the current branch name (if available)

  // FIXME: Extract a JIRA ticket ID from the branch name (if there seems to be
  // one)

  // FIXME: Warn if the branch ticket ID isn't the same as the subject line
  // ticket id

  return returnMe;
}

/**
 * Warn if JIRA ticket identifier isn't in CAPS ("dev-1234" should be
 * "DEV-1234")
 */
function getJiraCapsDiagnostic(firstLine: string): vscode.Diagnostic[] {
  const issueId = utils.findJiraIssueId(firstLine);
  if (issueId.id === "") {
    return [];
  }

  const allCaps = issueId.id.toUpperCase();
  if (issueId.id === allCaps) {
    return [];
  }

  return [
    utils.createDiagnostic(
      0,
      issueId.startIndex,
      issueId.startIndex + issueId.id.length,
      `JIRA issue ID should be in CAPS: ${allCaps}`,
      vscode.DiagnosticSeverity.Warning,
      {
        value: "JIRA issue ID format",
        target: jiraCapsUrl,
      }
    ),
  ];
}

export function createUpcaseJiraIdFix(
  doc: vscode.TextDocument,
  userPosition: vscode.Range | vscode.Selection
): vscode.CodeAction[] {
  if (doc.lineCount < 1) {
    return [];
  }
  const firstLine = doc.lineAt(0).text;

  const issue = utils.findJiraIssueId(firstLine);
  const fixRange = utils.createRange(
    0,
    issue.startIndex,
    issue.startIndex + issue.id.length
  );

  if (!fixRange.contains(userPosition)) {
    // Not in the right place
    return [];
  }

  const upcased = issue.id.toUpperCase();
  if (issue.id === upcased) {
    // Already upper case, never mind
    return [];
  }

  const fix = new vscode.CodeAction(
    "Convert JIRA issue ID to CAPS",
    vscode.CodeActionKind.QuickFix
  );
  fix.edit = new vscode.WorkspaceEdit();
  fix.edit.replace(doc.uri, fixRange, upcased);
  return [fix];
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  jiraCapsUrl,
  getJiraCapsDiagnostic,
  createUpcaseJiraIdFix,
};
