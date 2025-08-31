import * as vscode from "vscode";

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

export function isLower(char: string): boolean {
  return char == char.toLowerCase() && char != char.toUpperCase();
}

export function createRange(
  line: number,
  firstColumn: number,
  lastColumn: number,
): vscode.Range {
  return new vscode.Range(
    new vscode.Position(line, firstColumn),
    new vscode.Position(line, lastColumn),
  );
}

export function createDiagnostic(
  line: number,
  columnStart: number,
  columnEnd: number,
  message: string,
  severity: vscode.DiagnosticSeverity,
  code:
    | {
        value: string | number;
        target: vscode.Uri;
      }
    | undefined,
): vscode.Diagnostic {
  const range = createRange(line, columnStart, columnEnd);
  const returnMe = new vscode.Diagnostic(range, message, severity);
  returnMe.code = code;
  return returnMe;
}

export function findJiraIssueId(firstLine: string): JiraIssueIdPrefix {
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

export function getJiraIssueIdFromBranchName(
  branchName: string,
): string | undefined {
  const match = branchName.match(/^([a-zA-Z]+-[0-9]+)/);
  if (!match) {
    return undefined;
  }

  const jiraIssueId = match[1].toUpperCase();
  if (jiraIssueId.length === branchName.length) {
    // All JIRA issue id, no tail, return it!
    return jiraIssueId;
  }

  const charAfterIssueId = branchName.charAt(jiraIssueId.length);
  if (" _.-/".includes(charAfterIssueId)) {
    // JIRA issue ID properly terminated, return it!
    return jiraIssueId;
  }

  return undefined;
}
