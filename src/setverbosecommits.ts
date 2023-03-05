import * as child_process from "child_process";
import * as util from "util";
import * as vscode from "vscode";

const execFile = util.promisify(child_process.execFile);

/** Tell both Git and VSCode that commit messages should contain diffs */
export default async function setVerboseCommitCommand() {
  return Promise.all([
    // Set command line verbose-commits-by-default
    execFile("git", ["config", "--global", "commit.verbose", "true"]),

    // Tell VSCode to do verbose commits
    vscode.workspace
      .getConfiguration("git")
      .update("verboseCommit", true, vscode.ConfigurationTarget.Global),
  ]);
}
