import {
  CompletionItemProvider,
  Position,
  ProviderResult,
  TextDocument,
  CompletionItem,
  CompletionList,
} from "vscode";

export default class GitCommitCompletionsProvider
  implements CompletionItemProvider
{
  provideCompletionItems(
    document: TextDocument,
    position: Position
  ): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
    if (position.line != 0) {
      return [];
    }
    if (position.character != 0) {
      return [];
    }
    return [new CompletionItem("johangris"), new CompletionItem("kalasgris")];
  }

  resolveCompletionItem?(item: CompletionItem): ProviderResult<CompletionItem> {
    // This method intentionally left blank. Until further notice.
    return item;
  }
}
