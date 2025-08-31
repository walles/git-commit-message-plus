import * as vscode from "vscode";
import GitCommitCodeActionProvider from "./quickfix";
import GitCommitCompletionsProvider from "./completions";
import getCurrentGitBranch from "./getgitbranch";
import * as verbosecommits from "./verbosecommits";
import { getDiagnostics } from "./diagnostics";
import { displayVerboseDiffMessage } from "./messages";

export const setVerboseCommitCommandId =
  "git-commit-message-plus.setVerboseGitCommits";

/** Global variable updated on switching to new editors */
export let gitBranch: string | undefined = undefined;

let diagnosticCollection: vscode.DiagnosticCollection;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  diagnosticCollection =
    vscode.languages.createDiagnosticCollection("git-commit-message");
  context.subscriptions.push(diagnosticCollection);

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      "git-commit",
      new GitCommitCodeActionProvider(),
      {
        providedCodeActionKinds:
          GitCommitCodeActionProvider.providedCodeActionKinds,
      },
    ),
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "git-commit",
      new GitCommitCompletionsProvider(),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      setVerboseCommitCommandId,
      verbosecommits.enable,
    ),
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        doLinting(event.document);
      },
      null,
      context.subscriptions,
    ),
  );

  // Show informational toast about doing verbose Git commits
  vscode.workspace.onDidOpenTextDocument(
    displayVerboseDiffMessage,
    null,
    context.subscriptions,
  );

  // Call the listeners on initilization for current active text editor
  //
  // Inspiration from here:
  // https://github.com/golang/vscode-go/blob/d28aeac9bb6d98e0c6fdcb74199144cdae31f311/src/goMain.ts
  if (vscode.window.activeTextEditor) {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === "git-commit") {
      gitBranch = await getCurrentGitBranch(editor.document.uri);
      doLinting(editor.document);
      displayVerboseDiffMessage(editor.document);
    }
  }
  vscode.window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (editor && editor.document.languageId === "git-commit") {
        gitBranch = await getCurrentGitBranch(editor.document.uri);
        doLinting(editor.document);
      }
    },
    null,
    context.subscriptions,
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log("Git Commit Message Plus says good bye!");
}

function doLinting(doc: vscode.TextDocument) {
  if (doc.languageId !== "git-commit") {
    return;
  }

  diagnosticCollection.set(doc.uri, getDiagnostics(doc));
}
