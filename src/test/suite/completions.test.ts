import * as assert from "assert";
import * as vscode from "vscode";
import { createTextDocument } from "./common";
import * as completions from "../../completions";

const BRANCH = "jira-123";

/**
 * @param line Must contain a `|` to mark the cursor position
 */
function testLine(line: string, expectedCompletions: vscode.CompletionItem[]) {
  test("Line: " + line, async () => {
    const cursorPosition = line.indexOf("|");
    assert.ok(
      cursorPosition >= 0,
      "Must put a | in the line to mark the cursor position",
    );

    const withoutCursorMarker = line.replace("|", "");

    assert.deepEqual(
      await getCompletion(withoutCursorMarker, cursorPosition),
      expectedCompletions,
    );
  });
}

suite("JIRA Issue ID Completions From Branch Name", () => {
  testLine("|", [
    completions.completion("JIRA-123: ", 0, 0),
    completions.completion("[JIRA-123] ", 0, 0),
  ]);

  testLine("jir|", [
    completions.completion("JIRA-123: ", 0, 2),
    completions.completion("[JIRA-123] ", 0, 2),
  ]);
  testLine("JIR|", [
    completions.completion("JIRA-123: ", 0, 2),
    completions.completion("[JIRA-123] ", 0, 2),
  ]);
  testLine("jira-123|", [
    completions.completion("JIRA-123: ", 0, 7),
    completions.completion("[JIRA-123] ", 0, 7),
  ]);
  testLine("JIRA-123|", []);
  testLine("jira-123:|", []);

  // NOTE: See next NOTE for why these ranges seem one too long, they are
  // produced by the same code. And having these ranges work fine.

  testLine("[jir|", [completions.completion("[JIRA-123] ", 0, 4)]);
  testLine("[JIR|", [completions.completion("[JIRA-123] ", 0, 4)]);
  testLine("[jira-123|", [completions.completion("[JIRA-123] ", 0, 9)]);
  testLine("[JIRA-123|", [completions.completion("[JIRA-123] ", 0, 9)]);
  testLine("[jira-123]|", []);

  // NOTE: All the ends of these ranges seem to be one too much, but the reason
  // is that when testing this manually running VSCode v1.75.1 it turned out
  // that the "correct" numbers left a trailing ] character after picking the
  // completion.

  testLine("[|]", [completions.completion("[JIRA-123] ", 0, 2)]);
  testLine("[jir|]", [completions.completion("[JIRA-123] ", 0, 5)]);
  testLine("[JIR|]", [completions.completion("[JIRA-123] ", 0, 5)]);
  testLine("[jira-123|]", [completions.completion("[JIRA-123] ", 0, 10)]);
  testLine("[JIRA-123|]", [completions.completion("[JIRA-123] ", 0, 10)]);
  testLine("[jira-123]|", []);
});

async function getCompletion(
  firstLine: string,
  position: number,
): Promise<vscode.CompletionItem[]> {
  const doc = await createTextDocument([firstLine]);
  const pos = new vscode.Position(0, position);
  return completions._private.getBranchIssueCompletion(doc, pos, BRANCH);
}
