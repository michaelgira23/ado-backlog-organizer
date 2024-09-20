require("dotenv").config({ path: "../.env" });

const express = require("express");
const { buildWorkItemTypeStr, queryWorkItems } = require("./getWorkItems");
const { findSimilarWorkItems } = require("./findSimilarWorkItems");

const port = process.env.PORT ?? 8080;

const app = express();

app.use(express.json());

const WorkItemTypeNames = [
  "Bug",
  "Epic",
  "Feature",
  "Impediment",
  "Product Backlog Item",
  "Task",
  "Test Case",
  "User Story",
];

app.get("/", (req, res) => {
  res.json({ success: true });
});

app.post("/suggestions", async (req, res) => {
  try {
    const {
      AccessToken,
      OrganizationName,
      ProjectName,
      WorkItemTitle,
      WorkItemDescription,
      WorkItemTypes,
      AreaPath,
    } = req.body;

    const workItemTypeString = buildWorkItemTypeStr(
      WorkItemTypes,
      WorkItemTypeNames
    );
    const workItems = await queryWorkItems(
      AccessToken,
      OrganizationName,
      ProjectName,
      AreaPath,
      workItemTypeString
    );

    console.log("workItems", workItems);

    if (!workItems.length) {
      res.json({
        success: false,
        error: 'No work items found! Is your PAT valid?'
      });
      return;
    }

    const results = (await findSimilarWorkItems(WorkItemTitle, workItems)).map(
      (result) => ({
        ...result,
        linkUrl: `https://dev.azure.com/${OrganizationName}/${ProjectName}/_workitems/edit/${result.id}/`,
      })
    );

    res.json({ success: true, results, totalItems: workItems.length });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: error.message });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
