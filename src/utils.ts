import * as vscode from "vscode";

export function isLower(char: string): boolean {
  return char == char.toLowerCase() && char != char.toUpperCase();
}

export function createRange(
  line: number,
  firstColumn: number,
  lastColumn: number
): vscode.Range {
  return new vscode.Range(
    new vscode.Position(line, firstColumn),
    new vscode.Position(line, lastColumn)
  );
}
