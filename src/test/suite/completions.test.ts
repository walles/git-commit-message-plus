import * as assert from "assert";
import * as vscode from "vscode";
import { createTextDocument } from "./common";
import * as completions from "../../completions";

const BRANCH = "jira-123";

suite("JIRA Issue ID Completions From Branch Name", () => {
  test("Line: Empty", async () => {
    assert.deepEqual(await getCompletion("", 0), [
      completions.completion("JIRA-123: ", 0, 0),
      completions.completion("[JIRA-123] ", 0, 0),
    ]);
  });

  test("Line: [", async () => {
    assert.deepEqual(await getCompletion("[", 1), [
      completions.completion("[JIRA-123] ", 0, 0),
    ]);
  });

  test("Line: [|]", async () => {
    assert.deepEqual(await getCompletion("[]", 1), [
      completions.completion("[JIRA-123] ", 0, 1),
    ]);
  });

  test("Line: j", async () => {
    assert.deepEqual(await getCompletion("j", 1), [
      completions.completion("JIRA-123: ", 0, 1),
    ]);
  });

  test("Line: k", async () => {
    assert.deepEqual(await getCompletion("k", 1), []);
  });

  test("Line: [apa-321]", async () => {
    // Wrong ticket number in range, offer to fix it
    assert.deepEqual(await getCompletion("[apa-321] ", 9), [
      completions.completion("[JIRA-123] ", 0, 9),
    ]);
  });

  test("Line: [apa-321] Hello", async () => {
    // Wrong ticket number out of range, don't touch it
    assert.deepEqual(await getCompletion("[apa-321] Hello", 15), []);
  });
});

async function getCompletion(
  firstLine: string,
  position: number
): Promise<vscode.CompletionItem[]> {
  const doc = await createTextDocument([firstLine]);
  const pos = new vscode.Position(0, position);
  return completions._private.getBranchIssueCompletion(doc, pos, BRANCH);
}
