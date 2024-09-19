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
  console.log("suggestions", req.body);
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

    const results = await findSimilarWorkItems(WorkItemTitle, workItems);

    res.json({ success: true, results });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: error.message });
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
