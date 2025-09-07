import * as vscode from "vscode";

// Minimal web test harness without Mocha. The VS Code web test host will
// call run(), we just perform a couple of sanity checks.
export async function run(): Promise<void> {
  const problems: string[] = [];

  function assert(cond: boolean, message: string) {
    if (!cond) {
      problems.push(message);
    }
  }

  const ext = vscode.extensions.getExtension("walles.git-commit-message-plus");
  assert(!!ext, "Extension not found via vscode.extensions.getExtension");

  if (ext) {
    await ext.activate();
    assert(ext.isActive, "Extension failed to activate");
  }

  // Verify a command we expect exists
  const commands = await vscode.commands.getCommands(true);
  assert(
    commands.includes("git-commit-message-plus.setVerboseGitCommits"),
    "Expected command not registered",
  );

  if (problems.length > 0) {
    throw new Error("Web tests failed:\n" + problems.join("\n"));
  }
}
