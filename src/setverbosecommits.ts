import * as child_process from "child_process";
import * as util from "util";

const execFile = util.promisify(child_process.execFile);

export default async function setVerboseCommitCommand() {
  return Promise.all([
    gitConfigGlobalCommitVerbose(),
    vscodeSetGitVerboseCommitTrue(),
  ]);
}

/** Set command line verbose-commits-by-default */
async function gitConfigGlobalCommitVerbose() {
  return execFile("git", ["config", "--global", "commit.verbose"]);
}

/** Globally set the git.verboseCommit preference to true */
async function vscodeSetGitVerboseCommitTrue(): Promise<unknown> {
  // FIXME: Or send the user there to check the box themselves?
  //
  // For inspiration, see the "Verbose Git Commits Disabled" test
}
