import * as assert from "assert";
import * as vscode from "vscode";
import { createTextDocument } from "./common";
import * as completions from "../../completions";

suite("JIRA Issue ID Completions From Branch Name", () => {
  const BRANCH = "jira-123";

  test("Line: Empty", async () => {
    const doc = await createTextDocument([""]);
    const pos = new vscode.Position(0, 0);
    const actual = completions._private.getBranchIssueCompletion(
      doc,
      pos,
      BRANCH
    );

    assert.deepEqual(actual, [
      completion("JIRA-123: ", 0, 0),
      completion("[JIRA-123] ", 0, 0),
    ]);
  });
});

function completion(
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
