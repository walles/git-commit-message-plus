import * as vscode from "vscode";

import * as utils from "./utils";

/** Tell both Git and VSCode that commit messages should contain diffs */
export async function enable() {
  const promises = [];

  // Set command line verbose-commits-by-default only on desktop
  if (utils.execFile) {
    promises.push(
      utils.execFile!("git", ["config", "--global", "commit.verbose", "true"]),
    );
  }

  // Tell VSCode to do verbose commits
  promises.push(
    vscode.workspace
      .getConfiguration("git")
      .update("verboseCommit", true, vscode.ConfigurationTarget.Global),
  );

  return Promise.all(promises);
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
  if (!utils.execFile) {
    // Not desktop context, can't check git config, report that it doesn't need
    // changing
    return true;
  }
  try {
    const { stdout } = await utils.execFile!("git", [
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
