import * as vscode from "vscode";
import * as path from "path";
import * as utils from "./utils";
import { gitBranch, setVerboseCommitCommandId } from "./extension";
import { createBranchIssueIdFix, createUpcaseJiraIdFix } from "./jira";
import * as verbosecommits from "./verbosecommits";

// Inspired by:
// https://github.com/microsoft/vscode-extension-samples/blob/main/code-actions-sample/src/extension.ts

export default class GitCommitCodeActionProvider
  implements vscode.CodeActionProvider
{
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  public async provideCodeActions(
    doc: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ): Promise<vscode.CodeAction[]> {
    const returnMe: vscode.CodeAction[] = [];
    returnMe.push(...createUpcaseFirstSubjectCharFix(doc, range));
    returnMe.push(...createRemoveTrailingPunctuationFix(doc, range));
    returnMe.push(...createBranchIssueIdFix(gitBranch, doc, range));
    returnMe.push(...createUpcaseJiraIdFix(doc, range));

    if (path.basename(doc.fileName) === "COMMIT_EDITMSG") {
      returnMe.push(...(await createEnableGitVerboseCommitFix(doc, range)));
    }

    return returnMe;
  }
}

function createUpcaseFirstSubjectCharFix(
  doc: vscode.TextDocument,
  userPosition: vscode.Range | vscode.Selection
): vscode.CodeAction[] {
  if (doc.lineCount < 1) {
    return [];
  }
  const firstLine = doc.lineAt(0).text;

  const jiraIssueId = utils.findJiraIssueId(firstLine);
  const fixRange = utils.createRange(
    0,
    jiraIssueId.firstIndexAfter,
    jiraIssueId.firstIndexAfter + 1
  );

  if (!fixRange.contains(userPosition)) {
    // Not in the right place
    return [];
  }

  if (firstLine.length <= jiraIssueId.firstIndexAfter) {
    // No first char to replace
    return [];
  }

  const firstChar = firstLine.charAt(jiraIssueId.firstIndexAfter);
  if (!utils.isLower(firstChar)) {
    // Not lower case, never mind
    return [];
  }

  const fix = new vscode.CodeAction(
    "Capitalize subject line",
    vscode.CodeActionKind.QuickFix
  );
  fix.edit = new vscode.WorkspaceEdit();
  fix.edit.replace(doc.uri, fixRange, firstChar.toUpperCase());
  return [fix];
}

function createRemoveTrailingPunctuationFix(
  doc: vscode.TextDocument,
  userPosition: vscode.Range | vscode.Selection
): vscode.CodeAction[] {
  const firstLine = doc.lineAt(0).text;
  if (firstLine.length < 1) {
    // Nothing on the line => no trailing punctuation
    return [];
  }

  const lastChar = firstLine.charAt(firstLine.length - 1);
  if (lastChar != "." && lastChar != "!") {
    // Not ending in punctuation, never mind
    return [];
  }

  let trailingPunctuationStartIndex = firstLine.length - 1;
  while (trailingPunctuationStartIndex > 0) {
    const previousIndex = trailingPunctuationStartIndex - 1;
    const previousChar = firstLine.charAt(previousIndex);
    if (previousChar != "." && previousChar != "!") {
      break;
    }

    trailingPunctuationStartIndex--;
  }

  const fixRange = utils.createRange(
    0,
    trailingPunctuationStartIndex,
    firstLine.length
  );
  if (!fixRange.contains(userPosition)) {
    // Not in the right place
    return [];
  }

  const fix = new vscode.CodeAction(
    "Remove trailing punctuation",
    vscode.CodeActionKind.QuickFix
  );
  fix.edit = new vscode.WorkspaceEdit();
  fix.edit.replace(doc.uri, fixRange, "");
  return [fix];
}

async function createEnableGitVerboseCommitFix(
  doc: vscode.TextDocument,
  userPosition: vscode.Range | vscode.Selection
): Promise<vscode.CodeAction[]> {
  if (doc.lineCount < 2) {
    return [];
  }

  if (userPosition.start.line != doc.lineCount - 1) {
    // We're not on the last line, nothing to fix
    return [];
  }

  // Invariant: We're at the last line of the document

  const previousLine = doc.lineAt(doc.lineCount - 2).text;
  if (!previousLine.startsWith("#")) {
    // Previous line is not a comment, probably a diff, nothing to fix
    return [];
  }

  if (await verbosecommits.isEnabled()) {
    // Already enabled, we can't do anything
    return [];
  }

  const fix = new vscode.CodeAction(
    "Enable verbose Git commits",
    vscode.CodeActionKind.QuickFix
  );
  fix.command = {
    command: setVerboseCommitCommandId,
    title: "If you see this string in the UI, please open a ticket!",
  };

  return [fix];
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  createUpcaseFirstSubjectCharFix,
  createRemoveTrailingPunctuationFix,
  createEnableGitVerboseCommitFix,
};
