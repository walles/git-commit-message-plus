import * as vscode from "vscode";
import { gitBranch } from "./extension";
import * as utils from "./utils";

export default class GitCommitCompletionsProvider
  implements vscode.CompletionItemProvider
{
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    if (gitBranch) {
      return getBranchIssueCompletion(document, position, gitBranch);
    }
    return [];
  }

  resolveCompletionItem?(
    item: vscode.CompletionItem
  ): vscode.ProviderResult<vscode.CompletionItem> {
    // This method intentionally left blank. Until further notice.
    return item;
  }
}

function getBranchIssueCompletion(
  doc: vscode.TextDocument,
  position: vscode.Position,
  branch: string
): vscode.CompletionItem[] {
  if (position.line != 0) {
    return [];
  }
  if (doc.lineCount < 1) {
    return [];
  }
  const firstLine = doc.lineAt(0).text;

  const issueId = utils.getJiraIssueIdFromBranchName(branch);
  if (!issueId) {
    return [];
  }

  if (firstLine.length === 0) {
    return [
      completion(issueId + ": ", 0, 0),
      completion("[" + issueId + "] ", 0, 0),
    ];
  }

  const completions: vscode.CompletionItem[] = [];
  completions.push(
    ...getColonCompletion(firstLine, position.character, issueId)
  );
  // FIXME: completions.push(...getBracketsCompletion(firstLine, position.character, issueId));

  return completions;
}

function getColonCompletion(
  firstLine: string,
  character: number,
  issueId: string
): vscode.CompletionItem[] {
  const issueIdColon = issueId + ": ";

  // Is the user on their way to typing "JIRA-123: "? With the correct issue ID?
  const isTypingFreshly = character === firstLine.length;
  if (isTypingFreshly) {
    const typedSoFar = firstLine;
    const issueIdPrefix = issueId.substring(0, typedSoFar.length);

    if (typedSoFar.toLowerCase() == issueIdPrefix.toLowerCase()) {
      // FIXME: If the user only has the final space left, don't suggest anything

      return [completion(issueIdColon, 0, typedSoFar.length)];
    }
  }

  // FIXME: Has the user gone back to the start and started to type
  // "JIRA-123: "? With the correct issue ID?

  // FIXME: Are we touching a not-perfect issue ID that the user has already typed?

  return [];
}

/**
 * @param startColumn First column to be replaced
 * @param endColumn Last column to be replaced
 */
export function completion(
  label: string,
  startColumn: number,
  endColumn: number
): vscode.CompletionItem {
  const returnMe = new vscode.CompletionItem(
    label,
    vscode.CompletionItemKind.Text
  );
  returnMe.range = new vscode.Range(
    new vscode.Position(0, startColumn),
    new vscode.Position(0, endColumn)
  );
  return returnMe;
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  getBranchIssueCompletion,
};
