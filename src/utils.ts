/* global require */

/* eslint-disable @typescript-eslint/no-require-imports */

import * as vscode from "vscode";

/** JIRA-123 */
const jiraPrefixUndecorated = /^()([a-zA-Z]{2,}-[0-9]+) +/;

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
  let match = firstLine.match(jiraPrefixUndecorated);
  if (!match) {
    match = firstLine.match(jiraPrefixWithColon);
  }
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

/**
 * Returns the directory portion of a path, handling both / and \ separators.
 * Equivalent to Node's path.dirname, but works in browser and cross-platform.
 * @param filePath - The full file path.
 * @returns The directory portion of the path.
 */
export function dirname(filePath: string): string {
  // First, remove any trailing / or \
  filePath = filePath.replace(/[\\/]+$/, "");

  const parts = filePath.split(/[\\/]+/);
  parts.pop();
  return parts.join("/");
}

/**
 * Returns true if running in desktop VS Code (Node.js context), false otherwise (web context).
 */
export function isDesktopContext(): boolean {
  return typeof process !== "undefined" && !!process.versions?.node;
}

// Set up execFile on desktop only. On web it will be undefined.
type ExecFileType = (
  cmd: string,
  args: string[],
  options?: { cwd?: string },
) => Promise<{ stdout: string; stderr: string }>;
let execFile: ExecFileType | undefined;
if (isDesktopContext()) {
  const nodeUtil = require("util");
  const child_process = require("child_process");
  execFile = nodeUtil.promisify(child_process.execFile) as ExecFileType;
}
export { execFile };
