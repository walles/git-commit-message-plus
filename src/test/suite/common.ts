import * as vscode from "vscode";
import * as utils from "../../utils";

export class FakeTextDocument implements vscode.TextDocument {
  private lines: string[];

  uri: vscode.Uri;
  fileName: string;
  isUntitled: boolean;
  languageId: string;
  version: number;
  isDirty: boolean;
  isClosed: boolean;
  eol: vscode.EndOfLine;
  lineCount: number;

  lineAt(line: number | vscode.Position): vscode.TextLine {
    const lineNumber = line as number;
    const text = this.lines[lineNumber];
    return new FakeTextLine(lineNumber, text);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  offsetAt(position: vscode.Position): number {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  positionAt(offset: number): vscode.Position {
    throw new Error("Method not implemented.");
  }
  save(): Thenable<boolean> {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getText(range?: vscode.Range | undefined): string {
    throw new Error("Method not implemented.");
  }
  getWordRangeAtPosition(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    position: vscode.Position,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    regex?: RegExp | undefined
  ): vscode.Range | undefined {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateRange(range: vscode.Range): vscode.Range {
    throw new Error("Method not implemented.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validatePosition(position: vscode.Position): vscode.Position {
    throw new Error("Method not implemented.");
  }

  constructor(lines: string[]) {
    this.lines = lines;
    this.lineCount = lines.length;

    // NOTE: Only dummy data below this point, improve as needed
    this.uri = vscode.Uri.parse("file:///invalid-placeholder");
    this.fileName = "invalid-placeholder";
    this.isUntitled = false;
    this.languageId = "invalid-placeholder";
    this.version = 1;
    this.isDirty = false;
    this.isClosed = false;
    this.eol = vscode.EndOfLine.LF;
  }
}

class FakeTextLine implements vscode.TextLine {
  lineNumber: number;
  text: string;
  range: vscode.Range;
  rangeIncludingLineBreak: vscode.Range;
  firstNonWhitespaceCharacterIndex: number;
  isEmptyOrWhitespace: boolean;

  constructor(lineNumber: number, line: string) {
    this.lineNumber = lineNumber;
    this.text = line;
    this.isEmptyOrWhitespace = line.trim().length == 0;

    // NOTE: Only dummy data below this point, improve as needed
    this.range = utils.createRange(0, 0, 0);
    this.rangeIncludingLineBreak = utils.createRange(0, 0, 0);
    this.firstNonWhitespaceCharacterIndex = 0;
  }
}
