import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

import { execSync } from "child_process";

suite("Extension Integration", () => {
  test("Git branch detected in in-workspace file", async () => {
    const expectedBranch = execSync("git branch --show-current", {
      cwd: __dirname,
    })
      .toString()
      .trim();

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

      // Wait (up to ~2s) for async branch detection to populate gitBranch
      const deadline = Date.now() + 2000;
      let actualBranch: string | undefined = ext.exports.gitBranch;
      while (actualBranch != expectedBranch && Date.now() < deadline) {
        await new Promise((r) => globalThis.setTimeout(r, 50));
        actualBranch = ext.exports.gitBranch;
      }

      assert.strictEqual(actualBranch, expectedBranch);
    } finally {
      fs.rmSync(commitMessage);
    }
  });

  test("Git branch detected in not-in-workspace file", async () => {
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

      // Wait (up to ~2s) for async branch detection to populate gitBranch
      const deadline = Date.now() + 2000;
      let actualBranch: string | undefined = ext.exports.gitBranch;
      while (actualBranch != "test-branch" && Date.now() < deadline) {
        await new Promise((r) => globalThis.setTimeout(r, 50));
        actualBranch = ext.exports.gitBranch;
      }

      assert.strictEqual(actualBranch, "test-branch");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
