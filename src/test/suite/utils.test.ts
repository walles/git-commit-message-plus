import * as assert from "assert";

import * as utils from "../../utils";

suite("Utils", () => {
  test("Find JIRA issue ID", () => {
    assert.deepStrictEqual(utils.findJiraIssueId("[Jira-123] Hello"), {
      startIndex: 1,
      firstIndexAfter: 11,
      id: "Jira-123",
    });

    assert.deepStrictEqual(utils.findJiraIssueId("jira-123: Hello"), {
      startIndex: 0,
      firstIndexAfter: 10,
      id: "jira-123",
    });

    assert.deepStrictEqual(utils.findJiraIssueId("Hello"), {
      startIndex: 0,
      firstIndexAfter: 0,
      id: "",
    });
  });

  test("Get JIRA issue ID from branch name", () => {
    assert.equal(utils.getJiraIssueIdFromBranchName(""), undefined);
    assert.equal(utils.getJiraIssueIdFromBranchName("jira-1234"), "JIRA-1234");
    assert.equal(
      utils.getJiraIssueIdFromBranchName("Jira-1234-fluff"),
      "JIRA-1234"
    );
    assert.equal(
      utils.getJiraIssueIdFromBranchName("JIRA-1234/fluff"),
      "JIRA-1234"
    );
    assert.equal(
      utils.getJiraIssueIdFromBranchName("jira-1234.fluff"),
      "JIRA-1234"
    );
    assert.equal(
      utils.getJiraIssueIdFromBranchName("jira-1234fluff"),
      undefined
    );

    // Non-English chars not allowed:
    // https://confluence.atlassian.com/adminjiraserver/changing-the-project-key-format-938847081.html
    assert.equal(
      utils.getJiraIssueIdFromBranchName("jorå-1234.fluff"),
      undefined
    );
  });
});
