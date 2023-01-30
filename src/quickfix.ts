import * as vscode from "vscode";
import * as utils from "./utils";

// Inspired by:
// https://github.com/microsoft/vscode-extension-samples/blob/main/code-actions-sample/src/extension.ts

export default class GitCommitCodeActionProvider
  implements vscode.CodeActionProvider
{
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  public provideCodeActions(
    doc: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ): vscode.CodeAction[] {
    const returnMe: vscode.CodeAction[] = [];
    returnMe.push(
      ...GitCommitCodeActionProvider.createUpcaseFirstSubjectCharFix(doc, range)
    );

    return returnMe;
  }

  private static createUpcaseFirstSubjectCharFix(
    doc: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ): vscode.CodeAction[] {
    const fixRange = new vscode.Range(
      new vscode.Position(0, 0),
      new vscode.Position(0, 1)
    );
    if (!range.contains(fixRange)) {
      // Not in the right place
      return [];
    }

    const firstLine = doc.lineAt(0);
    if (firstLine.text.length == 0) {
      // No first char to replace
      return [];
    }

    const firstChar = firstLine.text.charAt(0);
    if (!utils.isLower(firstChar)) {
      // Not lower case, never mind
      return [];
    }

    const fix = new vscode.CodeAction(
      "Capitalize subject line ",
      vscode.CodeActionKind.QuickFix
    );
    fix.edit = new vscode.WorkspaceEdit();
    fix.edit.replace(doc.uri, fixRange, firstChar.toUpperCase());
    return [fix];
  }
}
