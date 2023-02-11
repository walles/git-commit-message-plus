import * as vscode from "vscode";

export async function createTextDocument(
  contents: string[]
): Promise<vscode.TextDocument> {
  return await vscode.workspace.openTextDocument({
    content: contents.join("\n"),
    language: "git-commit",
  });
}
