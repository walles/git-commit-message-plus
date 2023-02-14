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

  if (character !== firstLine.length) {
    // Not at the end of the line, never mind
    return [];
  }

  const typedSoFar = firstLine;
  const issueIdPrefix = issueId.substring(0, typedSoFar.length);

  if (typedSoFar.toLowerCase() == issueIdPrefix.toLowerCase()) {
    return [completion(issueIdColon, 0, Math.max(0, typedSoFar.length - 1))];
  }

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
