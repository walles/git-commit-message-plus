import * as child_process from "child_process";
import * as util from "util";
import * as vscode from "vscode";

const execFile = util.promisify(child_process.execFile);

export default async function setVerboseCommitCommand() {
  return Promise.all([
    // Set command line verbose-commits-by-default
    execFile("git", ["config", "--global", "commit.verbose"]),

    // Tell VSCode to do verbose commits
    vscode.workspace
      .getConfiguration("git")
      .update("verboseCommit", false, vscode.ConfigurationTarget.Global),
  ]);
}
