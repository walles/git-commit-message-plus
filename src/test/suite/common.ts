import * as assert from "assert";
import * as vscode from "vscode";

export async function createTextDocument(
  contents: string[]
): Promise<vscode.TextDocument> {
  return await vscode.workspace.openTextDocument({
    content: contents.join("\n"),
    language: "git-commit",
  });
}

/**
 * Assert we have exactly one code action, and that after applying it the doc
 * has the expected contents.
 */
export async function assertEditAction(
  codeActions: vscode.CodeAction[],
  expectedTitle: string,
  doc: vscode.TextDocument,
  expectedLinesAfterApply: string[]
) {
  assert.equal(codeActions.length, 1, "Expected exactly one code action");

  const action = codeActions[0];
  assert.equal(action.title, expectedTitle);

  // Apply the edit and verify the result
  if (!action.edit) {
    assert.fail("Code action has no WorkspaceEdit");
  }

  await vscode.workspace.applyEdit(action.edit);

  const actualLines = [];
  for (let i = 0; i < doc.lineCount; i++) {
    actualLines.push(doc.lineAt(i).text);
  }
  assert.deepEqual(actualLines, expectedLinesAfterApply);
}
