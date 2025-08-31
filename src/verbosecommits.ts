import * as vscode from "vscode";

import * as child_process from "child_process";
import * as util from "util";
const execFile = util.promisify(child_process.execFile);

/** Tell both Git and VSCode that commit messages should contain diffs */
export async function enable() {
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
 * Basically, if this function returns true then enable() won't have any effect.
 */
export async function isEnabled(): Promise<boolean> {
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

export function doesVsCodeDoVerboseCommits(): boolean {
  return (
    vscode.workspace.getConfiguration().get<boolean>("git.verboseCommit") ===
    true
  );
}

export async function doesGitDoVerboseCommits(): Promise<boolean> {
  try {
    const { stdout } = await execFile("git", [
      "config",
      "--global",
      "commit.verbose",
    ]);
    return stdout.trim() == "true";
  } catch (e) {
    // This usually means "commit.verbose" isn't set. And it defaults to off.
    console.debug(
      "Asking git for commit.verbose value failed, assuming it's off",
      e,
    );
    return false;
  }
}
