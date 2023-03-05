import * as child_process from "child_process";
import * as util from "util";
import * as vscode from "vscode";

const execFile = util.promisify(child_process.execFile);

/** Tell both Git and VSCode that commit messages should contain diffs */
export async function setVerboseCommitCommand() {
  return Promise.all([
    // Set command line verbose-commits-by-default
    execFile("git", ["config", "--global", "commit.verbose", "true"]),

    // Tell VSCode to do verbose commits
    vscode.workspace
      .getConfiguration("git")
      .update("verboseCommit", true, vscode.ConfigurationTarget.Global),
  ]);
}

/**
 * Check whether there's something we can change to make verbose commits more
 * likely.
 *
 * Basically, if this function returns true then setVerboseCommitCommand() won't
 * have any effect.
 */
export async function isVerboseCommitsEnabled(): Promise<boolean> {
  if (!doesVsCodeDoVerboseCommits()) {
    // VSCode setting can be updated
    return false;
  }
  if (!(await doesGitDoVerboseCommits())) {
    // Git setting can be updated
    return false;
  }

  // Yes, fully enabled
  return true;
}

export async function doesGitDoVerboseCommits(): Promise<boolean> {
  const { stdout } = await execFile("git", [
    "config",
    "--global",
    "commit.verbose",
  ]);
  return stdout.trim() == "true";
}

export function doesVsCodeDoVerboseCommits(): boolean {
  return (
    vscode.workspace.getConfiguration().get<boolean>("git.verboseCommit") ===
    true
  );
}
