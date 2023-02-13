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
