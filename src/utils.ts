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

export function createDiagnostic(
  line: number,
  columnStart: number,
  columnEnd: number,
  message: string,
  severity: vscode.DiagnosticSeverity,
  code:
    | {
        value: string | number;
        target: vscode.Uri;
      }
    | undefined
): vscode.Diagnostic {
  const range = createRange(line, columnStart, columnEnd);
  const returnMe = new vscode.Diagnostic(range, message, severity);
  returnMe.code = code;
  return returnMe;
}
