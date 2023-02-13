import {
  CompletionItemProvider,
  Position,
  ProviderResult,
  TextDocument,
  CompletionItem,
  CompletionList,
} from "vscode";
import { gitBranch } from "./extension";

export default class GitCommitCompletionsProvider
  implements CompletionItemProvider
{
  provideCompletionItems(
    document: TextDocument,
    position: Position
  ): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
    if (gitBranch) {
      return getBranchIssueCompletion(document, position, gitBranch);
    }
    return [];
  }

  resolveCompletionItem?(item: CompletionItem): ProviderResult<CompletionItem> {
    // This method intentionally left blank. Until further notice.
    return item;
  }
}

function getBranchIssueCompletion(
  doc: TextDocument,
  position: Position,
  branch: string
): CompletionItem[] {
  if (position.line != 0) {
    return [];
  }
  if (position.character != 0) {
    return [];
  }
  return [new CompletionItem("johangris"), new CompletionItem("kalasgris")];
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  getBranchIssueCompletion,
};
