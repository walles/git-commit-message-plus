import * as vscode from "vscode";
import * as git from "./git";
import * as child_process from "child_process";
import * as nodeUtil from "util";
import * as utils from "./utils";

const execFile = nodeUtil.promisify(child_process.execFile);

export default async function getCurrentGitBranch(
  docUri: vscode.Uri,
): Promise<string | undefined> {
  return (
    getCurrentGitBranchFromVscode(docUri) ||
    (await getCurrentGitBranchFromGit(docUri))
  );
}

function getCurrentGitBranchFromVscode(docUri: vscode.Uri): string | undefined {
  console.debug("Git branch requested from VSCode for document", docUri);

  const extension =
    vscode.extensions.getExtension<git.GitExtension>("vscode.git");
  if (!extension) {
    console.warn("Git extension not available");
    return undefined;
  }
  if (!extension.isActive) {
    console.warn("Git extension not active");
    return undefined;
  }

  // "1" == "Get version 1 of the API". Version one seems to be the latest when I
  // type this.
  const git = extension.exports.getAPI(1);
  const repository = git.getRepository(docUri);
  if (!repository) {
    console.warn("No Git repository for current document", docUri);
    return undefined;
  }

  const currentBranch = repository.state.HEAD;
  if (!currentBranch) {
    console.warn("No HEAD branch for current document", docUri);
    return undefined;
  }

  const branchName = currentBranch.name;
  if (!branchName) {
    console.warn("Current branch has no name", docUri, currentBranch);
    return undefined;
  }

  console.debug("VSCode: Current branch name", branchName);
  return branchName;
}

async function getCurrentGitBranchFromGit(
  docUri: vscode.Uri,
): Promise<string | undefined> {
  console.debug("Git branch requested from Git for document", docUri);

  if (docUri.scheme != "file") {
    console.warn('Not a "file:" URI, can\'t use the git binary', docUri);
    return undefined;
  }

  const docWithAbsolutePath = docUri.fsPath;
  const docDirectory = utils.dirname(docWithAbsolutePath);

  try {
    const { stdout } = await execFile("git", ["branch", "--show-current"], {
      cwd: docDirectory,
    });

    const branchName = stdout.trim();
    if (!branchName) {
      console.warn("No git branch found", docUri, branchName);
      return undefined;
    }

    console.debug("Git: Current branch name", branchName);
    return branchName;
  } catch (e) {
    console.warn("Git invocation failed", docUri, e);
    return undefined;
  }
}
