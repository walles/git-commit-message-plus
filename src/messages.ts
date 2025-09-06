import * as vscode from "vscode";
import * as verbosecommits from "./verbosecommits";
import * as utils from "./utils";

/** Show informational toast about doing verbose Git commits */
export async function displayVerboseDiffMessage(doc: vscode.TextDocument) {
  if (utils.basename(doc.fileName) !== "COMMIT_EDITMSG") {
    // We only like one kind of files
    return;
  }

  if (await verbosecommits.isEnabled()) {
    // Already done
    return;
  }

  const decision = await vscode.window.showInformationMessage(
    "Use verbose Git commits to see diffs while typing your commit message",
    "Enable verbose commits",
  );
  if (decision === undefined) {
    return;
  }

  // User picked the only option, let's do it!
  await verbosecommits.enable();
}
