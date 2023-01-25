import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as extension from '../../extension';

class FakeTextDocument implements extension.TextDocumentLite {
	private readonly lines: string[];
	readonly lineCount: number;

	constructor(lines: string[]) {
		this.lines = lines;
		this.lineCount = lines.length;
	}

	lineAt(line: number): extension.TextLineLite {
		return { "text": this.lines[line] };
	}
}

suite('Git Commit Message Plus', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Empty Text Document', () => {
		const empty = new FakeTextDocument([]);
		assert.deepStrictEqual(extension._private.getDiagnostics(empty), []);
	});

	test('First line 72 chars', () => {
		const empty = new FakeTextDocument(['x'.repeat(72)]);
		assert.deepStrictEqual(extension._private.getDiagnostics(empty), []);
	});

});
