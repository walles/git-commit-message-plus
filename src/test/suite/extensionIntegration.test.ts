import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

import { execSync } from "child_process";

suite("Extension Integration", () => {
  test("Git branch detected in in-workspace file", async function () {
    this.timeout(5000); // Should be longer than the deadline below

    const expectedBranch = execSync("git branch --show-current", {
      cwd: __dirname,
    })
      .toString()
      .trim();

    if (!expectedBranch) {
      console.log(
        "Skipping test: Not on any git branch. Happens with GitHub Actions.",
      );
      return;
    }

    const commitMessage = path.join(__dirname, "COMMIT_EDITMSG");
    fs.writeFileSync(commitMessage, "For testing\n\nThese are some words.\n");

    try {
      // Open the file in an editor
      const doc = await vscode.workspace.openTextDocument(
        vscode.Uri.file(commitMessage),
      );
      await vscode.window.showTextDocument(doc);

      // Wait for extension activation to complete
      const ext = vscode.extensions.getExtension(
        "walles.git-commit-message-plus",
      )!;
      await ext.activate();

      // Wait (up to ~4s) for async branch detection to populate gitBranch
      const deadline = Date.now() + 4000; // Should be shorter than the test timeout above
      while (ext.exports.gitBranch != expectedBranch && Date.now() < deadline) {
        await new Promise((r) => globalThis.setTimeout(r, 50));
      }

      assert.strictEqual(ext.exports.gitBranch, expectedBranch);
    } finally {
      fs.rmSync(commitMessage);
    }
  });

  test("Git branch detected in not-in-workspace file", async function () {
    this.timeout(5000); // Should be longer than the deadline below

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-commit-test-"));

    try {
      const commitMessage = path.join(tmpDir, "COMMIT_EDITMSG");
      fs.writeFileSync(commitMessage, "Initial commit\n\nDetails here.\n");

      // Create a repo and a branch that we can detect
      execSync("git init", { cwd: tmpDir });
      execSync("git checkout -b test-branch", { cwd: tmpDir });

      // Open the file in an editor
      const doc = await vscode.workspace.openTextDocument(
        vscode.Uri.file(commitMessage),
      );
      await vscode.window.showTextDocument(doc);

      // Wait for extension activation to complete
      const ext = vscode.extensions.getExtension(
        "walles.git-commit-message-plus",
      )!;
      await ext.activate();

      // Wait (up to ~4s) for async branch detection to populate gitBranch
      const deadline = Date.now() + 4000; // Should be shorter than the test timeout above
      while (ext.exports.gitBranch != "test-branch" && Date.now() < deadline) {
        await new Promise((r) => globalThis.setTimeout(r, 50));
      }

      assert.strictEqual(ext.exports.gitBranch, "test-branch");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
