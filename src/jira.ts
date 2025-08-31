import * as vscode from "vscode";
import * as utils from "./utils";
import * as extension from "./extension";

const jiraCapsUrl = vscode.Uri.parse(
  "https://confluence.atlassian.com/adminjiraserver/changing-the-project-key-format-938847081.html",
);

export default function getJiraDiagnostics(
  doc: vscode.TextDocument,
): vscode.Diagnostic[] {
  if (doc.lineCount < 1) {
    return [];
  }

  const firstLine = doc.lineAt(0).text;
  const returnMe: vscode.Diagnostic[] = [];

  returnMe.push(...getJiraCapsDiagnostic(firstLine));
  returnMe.push(
    ...getJiraBranchIdMismatchDiagnostic(extension.gitBranch, firstLine),
  );

  return returnMe;
}

/**
 * Warn if JIRA issue ID isn't in CAPS ("dev-1234" should be "DEV-1234")
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
      },
    ),
  ];
}

function getJiraBranchIdMismatchDiagnostic(
  gitBranch: string | undefined,
  firstLine: string,
): vscode.Diagnostic[] {
  const docIssueId = utils.findJiraIssueId(firstLine);
  if (docIssueId.id === "") {
    return [];
  }

  if (!gitBranch) {
    return [];
  }

  const branchIssueId = utils.getJiraIssueIdFromBranchName(gitBranch);
  if (!branchIssueId) {
    // No issue ID in the branch name, never mind
    return [];
  }
  if (docIssueId.id.toUpperCase() === branchIssueId) {
    // Text and branch match, done!
    return [];
  }

  return [
    utils.createDiagnostic(
      0,
      docIssueId.startIndex,
      docIssueId.startIndex + docIssueId.id.length,
      `JIRA issue ID should match the branch name: ${branchIssueId}`,
      vscode.DiagnosticSeverity.Error,
      undefined,
    ),
  ];
}

export function createUpcaseJiraIdFix(
  doc: vscode.TextDocument,
  userPosition: vscode.Range | vscode.Selection,
): vscode.CodeAction[] {
  if (doc.lineCount < 1) {
    return [];
  }
  const firstLine = doc.lineAt(0).text;

  const issue = utils.findJiraIssueId(firstLine);
  const fixRange = utils.createRange(
    0,
    issue.startIndex,
    issue.startIndex + issue.id.length,
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
    vscode.CodeActionKind.QuickFix,
  );
  fix.edit = new vscode.WorkspaceEdit();
  fix.edit.replace(doc.uri, fixRange, upcased);
  return [fix];
}

export function createBranchIssueIdFix(
  branchName: string | undefined,
  doc: vscode.TextDocument,
  userPosition: vscode.Range | vscode.Selection,
): vscode.CodeAction[] {
  if (!branchName) {
    return [];
  }
  const branchIssue = utils.getJiraIssueIdFromBranchName(branchName);
  if (!branchIssue) {
    return [];
  }

  if (doc.lineCount < 1) {
    return [];
  }
  const firstLine = doc.lineAt(0).text;

  const docIssue = utils.findJiraIssueId(firstLine);
  if (docIssue.id === "") {
    // No JIRA issue in the doc, never mind
    return [];
  }
  if (docIssue.id.toUpperCase() === branchIssue) {
    // Already done, never mind. If casing doesn't match then let's leave that
    // to createUpcaseJiraIdFix().
    return [];
  }

  const fixRange = utils.createRange(
    0,
    docIssue.startIndex,
    docIssue.startIndex + docIssue.id.length,
  );

  if (!fixRange.contains(userPosition)) {
    // Not in the right place
    return [];
  }

  const fix = new vscode.CodeAction(
    `Set issue ID from branch: ${branchIssue}`,
    vscode.CodeActionKind.QuickFix,
  );
  fix.edit = new vscode.WorkspaceEdit();
  fix.edit.replace(doc.uri, fixRange, branchIssue);
  return [fix];
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  jiraCapsUrl,
  getJiraCapsDiagnostic,
  getJiraBranchIdMismatchDiagnostic,
  createUpcaseJiraIdFix,
  createBranchIssueIdFix,
};
