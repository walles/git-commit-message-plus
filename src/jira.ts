import * as vscode from "vscode";

const jiraCapsUrl = vscode.Uri.parse(
  "https://confluence.atlassian.com/adminjiraserver/changing-the-project-key-format-938847081.html"
);

/** JIRA-123: */
const jiraPrefixWithColon = /^()([a-zA-Z]{2,}-[0-9]+): +/;

/** [JIRA-123] */
const jiraPrefixWithBrackets = /^(\[)([a-zA-Z]{2,}-[0-9]+)\] +/;

interface JiraIssueIdPrefix {
  /** 0 for "JIRA-123: ..." and 1 for "[JIRA-123] ..." */
  startIndex: number;

  /** At which index does the actual subject line start? */
  firstIndexAfter: number;

  /** Example: "JIRA-123" */
  id: string;
}

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

function findIssueId(firstLine: string): JiraIssueIdPrefix {
  let match = firstLine.match(jiraPrefixWithColon);
  if (!match) {
    match = firstLine.match(jiraPrefixWithBrackets);
  }
  if (!match) {
    return { startIndex: 0, firstIndexAfter: 0, id: "" };
  }

  return {
    startIndex: match[1].length,
    firstIndexAfter: match[0].length,
    id: match[2],
  };
}

/**
 * Warn if JIRA ticket identifier isn't in ALL CAPS ("dev-1234" should be
 * "DEV-1234")
 */
function getJiraCapsDiagnostic(firstLine: string): vscode.Diagnostic[] {
  return [];
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  jiraCapsUrl,
  getJiraCapsDiagnostic,
  findIssueId,
};
