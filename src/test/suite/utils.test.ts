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
});
