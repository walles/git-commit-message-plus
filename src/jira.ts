import * as vscode from "vscode";

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
 * Warn if JIRA ticket identifier isn't in ALL CAPS ("dev-1234" should be
 * "DEV-1234")
 */
function getJiraCapsDiagnostic(firstLine: string): vscode.Diagnostic[] {
  return [];
}

export const _private = {
  jiraCapsUrl,
  getJiraCapsDiagnostic,
};
