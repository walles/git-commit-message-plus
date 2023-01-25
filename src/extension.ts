// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let diagnosticCollection: vscode.DiagnosticCollection;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Git Commit Message Plus says hello!');

	diagnosticCollection = vscode.languages.createDiagnosticCollection('git-commit-message');
	context.subscriptions.push(diagnosticCollection);

	const documentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
		const doc = event.document;
		if (doc.languageId !== 'git-commit') {
			return;
		}

		diagnosticCollection.set(doc.uri, getDiagnostics(doc));
	}, null, context.subscriptions);
	context.subscriptions.push(documentChangeListener);

	// FIXME: Make sure linting is triggered when we open a commit message, not
	// just when it changes. I tried to react to onDidOpenTextDocument(), but
	// documents seem to default to plain-text when loaded so that didn't work.
}

// This method is called when your extension is deactivated
export function deactivate() {
	console.log('Git Commit Message Plus says good bye!');
}

function getDiagnostics(doc: vscode.TextDocument): vscode.Diagnostic[] {
	console.log('FIXME: Lint the document!');
	return [];
}
