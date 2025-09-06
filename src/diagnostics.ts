import * as vscode from "vscode";
import * as utils from "./utils";
// ...existing code...
import getJiraDiagnostics from "./jira";

const preferSubjectLineLength = 50;
const maxSubjectLineLength = 72;
const subjectLineLengthUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#limit-50",
);
const subjectLinePunctuationUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#end",
);
const subjectLineCapitalizationUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#capitalize",
);
const secondLineBlankUrl = vscode.Uri.parse(
  "https://cbea.ms/git-commit/#separate",
);

export function getDiagnostics(doc: vscode.TextDocument): vscode.Diagnostic[] {
  const returnMe: vscode.Diagnostic[] = [];

  if (doc.lineCount >= 1) {
    const firstLine = doc.lineAt(0).text;
    returnMe.push(...getFirstLine50Diagnostic(firstLine));
    returnMe.push(...getFirstLine72Diagnostic(firstLine));
    returnMe.push(...getFirstLinePunctuationDiagnostic(firstLine));
    returnMe.push(...getFirstLineCapsDiagnostic(firstLine));
    returnMe.push(...getJiraDiagnostics(doc));
  }

  if (doc.lineCount >= 2) {
    const secondLine = doc.lineAt(1).text;
    returnMe.push(...getSecondLineDiagnostic(secondLine));
  }

  if (utils.basename(doc.fileName) === "COMMIT_EDITMSG") {
    returnMe.push(...getNoDiffDiagnostic(doc));
  }

  return returnMe;
}

function getFirstLine50Diagnostic(firstLine: string): vscode.Diagnostic[] {
  if (firstLine.length <= preferSubjectLineLength) {
    return [];
  }

  return [
    utils.createDiagnostic(
      0,
      preferSubjectLineLength,
      maxSubjectLineLength,
      `Try keeping the subject line to at most ${preferSubjectLineLength} characters`,
      vscode.DiagnosticSeverity.Warning,
      {
        target: subjectLineLengthUrl,
        value: "Subject Line Length",
      },
    ),
  ];
}

function getFirstLine72Diagnostic(firstLine: string): vscode.Diagnostic[] {
  if (firstLine.length <= maxSubjectLineLength) {
    return [];
  }

  return [
    utils.createDiagnostic(
      0,
      maxSubjectLineLength,
      firstLine.length,
      `Keep the subject line to at most ${maxSubjectLineLength} characters`,
      vscode.DiagnosticSeverity.Error,
      { target: subjectLineLengthUrl, value: "Subject Line Length" },
    ),
  ];
}

function getFirstLinePunctuationDiagnosticHelper(
  firstLine: string,
  badSuffix: string,
  suffixDescription: string,
): vscode.Diagnostic | null {
  if (!firstLine.endsWith(badSuffix)) {
    return null;
  }

  return utils.createDiagnostic(
    0,
    firstLine.length - badSuffix.length,
    firstLine.length,
    "Do not end the subject line with " + suffixDescription,
    vscode.DiagnosticSeverity.Error,
    { target: subjectLinePunctuationUrl, value: "Subject Line Punctuation" },
  );
}

function getFirstLinePunctuationDiagnostic(
  firstLine: string,
): vscode.Diagnostic[] {
  const d =
    getFirstLinePunctuationDiagnosticHelper(firstLine, "...", "an ellipsis") ||
    getFirstLinePunctuationDiagnosticHelper(firstLine, ".", "a period") ||
    getFirstLinePunctuationDiagnosticHelper(
      firstLine,
      "!",
      "an exclamation mark",
    );
  if (d != null) {
    return [d];
  }
  return [];
}

function getFirstLineCapsDiagnostic(firstLine: string): vscode.Diagnostic[] {
  const jiraPrefix = utils.findJiraIssueId(firstLine);
  if (firstLine.length <= jiraPrefix.firstIndexAfter) {
    return [];
  }
  const firstChar = firstLine.charAt(jiraPrefix.firstIndexAfter);

  if (utils.isLower(firstChar)) {
    return [
      utils.createDiagnostic(
        0,
        jiraPrefix.firstIndexAfter,
        jiraPrefix.firstIndexAfter + 1,
        "First line should start with a Capital Letter",
        vscode.DiagnosticSeverity.Error,
        {
          target: subjectLineCapitalizationUrl,
          value: "Subject Line Capitalization",
        },
      ),
    ];
  }

  return [];
}

function getSecondLineDiagnostic(secondLine: string): vscode.Diagnostic[] {
  if (secondLine.length == 0) {
    return [];
  }

  if (secondLine.startsWith("#")) {
    return [];
  }

  return [
    utils.createDiagnostic(
      1,
      0,
      secondLine.length,
      "Leave the second line blank",
      vscode.DiagnosticSeverity.Error,
      { target: secondLineBlankUrl, value: "Blank Second Line" },
    ),
  ];
}

function getNoDiffDiagnostic(doc: vscode.TextDocument): vscode.Diagnostic[] {
  if (doc.lineCount < 2) {
    return [];
  }

  let lastNonEmptyLineNumber = doc.lineCount - 1;
  let lastNonEmptyLine = doc.lineAt(lastNonEmptyLineNumber);
  if (lastNonEmptyLine.text.length == 0) {
    lastNonEmptyLineNumber = doc.lineCount - 2;
    lastNonEmptyLine = doc.lineAt(lastNonEmptyLineNumber);
  }

  if (!lastNonEmptyLine.text.startsWith("#")) {
    // Not a comment, probably a diff
    return [];
  }

  return [
    utils.createDiagnostic(
      doc.lineCount - 1, // Place diagnostic on the last line
      0,
      doc.lineAt(doc.lineCount - 1).text.length,
      "Use `git commit -v` to see diffs here",
      vscode.DiagnosticSeverity.Information,
      undefined,
    ),
  ];
}

// Exports for testing
//
// Ref: https://stackoverflow.com/a/65422568/473672
export const _private = {
  getDiagnostics,
  getFirstLine50Diagnostic,
  getFirstLine72Diagnostic,
  getFirstLinePunctuationDiagnostic,
  getFirstLineCapsDiagnostic,
  getSecondLineDiagnostic,
  getNoDiffDiagnostic,
  subjectLineLengthUrl,
  subjectLinePunctuationUrl,
  subjectLineCapitalizationUrl,
  secondLineBlankUrl,
};
