import * as assert from "assert";
import { assertEditAction, createTextDocument } from "./common";

import * as quickfix from "../../quickfix";
import * as utils from "../../utils";
import * as vscode from "vscode";
import * as child_process from "child_process";
import * as util from "util";
import { ConfigurationTarget, workspace } from "vscode";
import { setVerboseCommitCommandId } from "../../extension";

const execFile = util.promisify(child_process.execFile);

suite("Quick Fix", () => {
  suite("Capitalize subject line", () => {
    test("Simple example", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 0, 0)
      );

      // FIXME: Verify the code action points back to the right diagnostic

      await assertEditAction(actual, "Capitalize subject line", doc, [
        "This subject has initial lower case",
      ]);
    });

    test("On second character", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 1, 1)
      );

      await assertEditAction(actual, "Capitalize subject line", doc, [
        "This subject has initial lower case",
      ]);
    });

    test("Selection of first to second character", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 0, 1)
      );

      await assertEditAction(actual, "Capitalize subject line", doc, [
        "This subject has initial lower case",
      ]);
    });

    test("On third character", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 2, 2)
      );
      assert.deepEqual(actual, []);
    });

    test("Selection of first to third character", async () => {
      const doc = await createTextDocument([
        "this subject has initial lower case",
      ]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 0, 2)
      );
      assert.deepEqual(actual, []);
    });

    test("[JIRA-123] with JIRA prefix", async () => {
      const doc = await createTextDocument(["[JIRA-123] with JIRA prefix"]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 11, 11)
      );

      // FIXME: Verify the code action points back to the right diagnostic

      await assertEditAction(actual, "Capitalize subject line", doc, [
        "[JIRA-123] With JIRA prefix",
      ]);
    });

    test("JIRA-123: with JIRA prefix", async () => {
      const doc = await createTextDocument(["JIRA-123: with JIRA prefix"]);
      const actual = quickfix._private.createUpcaseFirstSubjectCharFix(
        doc,
        utils.createRange(0, 10, 10)
      );

      // FIXME: Verify the code action points back to the right diagnostic

      await assertEditAction(actual, "Capitalize subject line", doc, [
        "JIRA-123: With JIRA prefix",
      ]);
    });
  });

  suite("Remove trailing punctuation", () => {
    test("Left of the punctuation", async () => {
      const doc = await createTextDocument([
        "This subject has trailing punctuation.",
      ]);
      const actual = quickfix._private.createRemoveTrailingPunctuationFix(
        doc,
        utils.createRange(0, 37, 37)
      );

      // FIXME: Verify the code action points back to the right diagnostic

      await assertEditAction(actual, "Remove trailing punctuation", doc, [
        "This subject has trailing punctuation",
      ]);
    });

    test("Right of the punctuation", async () => {
      const doc = await createTextDocument([
        "This subject has trailing punctuation.",
      ]);
      const actual = quickfix._private.createRemoveTrailingPunctuationFix(
        doc,
        utils.createRange(0, 38, 38)
      );

      await assertEditAction(actual, "Remove trailing punctuation", doc, [
        "This subject has trailing punctuation",
      ]);
    });

    test("Not touching the punctuation", async () => {
      const doc = await createTextDocument([
        "This subject has trailing punctuation.",
      ]);
      const actual = quickfix._private.createRemoveTrailingPunctuationFix(
        doc,
        utils.createRange(0, 36, 36)
      );
      assert.deepEqual(actual, []);
    });
  });

  suite("Enable VSCode Verbose Git Commits Setting", () => {
    test("Verbose Git Commits Disabled", async () => {
      const withoutDiff = await createTextDocument([
        "Fnord the Blorgs before releasing them",
        "# Git: bla bla",
        "",
      ]);

      // Disable Verbose Git Commits, otherwise we shouldn't get any quick fix
      await workspace
        .getConfiguration("git")
        .update("verboseCommit", false, ConfigurationTarget.Global);

      const codeActions = quickfix._private.createEnableGitVerboseCommitFix(
        withoutDiff,
        utils.createRange(2, 0, 0)
      );

      // FIXME: Verify the code action points back to the right diagnostic

      assert.equal(codeActions.length, 1, "Exactly one Quick Fix expected");
      const action = codeActions[0];
      assert.equal(action.command?.command, setVerboseCommitCommandId);

      // Execute the command
      //
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await vscode.commands.executeCommand(action.command!.command);

      // Verify VSCode verbose commits are now enabled
      const verboseCommitsEnabledFromVsCode = workspace
        .getConfiguration()
        .get<boolean>("git.verboseCommit");
      assert.equal(
        verboseCommitsEnabledFromVsCode,
        true,
        "Verbose Git commits in VSCode"
      );

      // Verify git is configured for verbose commits
      const { stdout } = await execFile("git", [
        "config",
        "--global",
        "commit.verbose",
      ]);
      const verboseCommitsEnabledFromGit = stdout.trim();
      assert.equal(
        verboseCommitsEnabledFromGit,
        "true",
        "Verbose Git commits in Git"
      );
    });

    test("Verbose Git Commits Enabled", async () => {
      const withoutDiff = await createTextDocument([
        "Fnord the Blorgs before releasing them",
        "# Git: bla bla",
        "",
      ]);

      // Enable Verbose Git Commits, otherwise we should get the quick fix
      await workspace
        .getConfiguration("git")
        .update("verboseCommit", true, ConfigurationTarget.Global);

      const codeActions = quickfix._private.createEnableGitVerboseCommitFix(
        withoutDiff,
        utils.createRange(2, 0, 0)
      );

      assert.equal(
        codeActions.length,
        0,
        "Code actions count with verbose commits already enabled"
      );
    });

    test("In the Wrong Place", async () => {
      const withoutDiff = await createTextDocument([
        "Fnord the Blorgs before releasing them",
        "# Git: bla bla",
        "",
      ]);

      // Disable Verbose Git Commits, otherwise we shouldn't get any quick fix
      await workspace
        .getConfiguration("git")
        .update("verboseCommit", false, ConfigurationTarget.Global);

      const codeActions = quickfix._private.createEnableGitVerboseCommitFix(
        withoutDiff,
        utils.createRange(1, 0, 0)
      );

      assert.equal(codeActions.length, 0);
    });
  });
});
