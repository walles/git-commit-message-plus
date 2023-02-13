import {
  CancellationToken,
  InlineCompletionContext,
  InlineCompletionItem,
  InlineCompletionItemProvider,
  InlineCompletionList,
  Position,
  ProviderResult,
  TextDocument,
} from "vscode";

export default class GitCommitCompletionsProvider
  implements InlineCompletionItemProvider
{
  provideInlineCompletionItems(
    document: TextDocument,
    position: Position,
    context: InlineCompletionContext,
    token: CancellationToken
  ): ProviderResult<InlineCompletionItem[] | InlineCompletionList> {
    if (position.line != 0) {
      return [];
    }
    if (position.character != 0) {
      return [];
    }
    return [
      {
        insertText: "johan",
      },
    ];
  }
}
