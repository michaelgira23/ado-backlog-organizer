const axios = require("axios");

// ('Feature', 'Epic')
function buildWorkItemTypeStr(workItemTypes, workItemTypeNames) {
  let workItemStr = "(";
  for (let i = 0; i < workItemTypes.length; i++) {
    if (workItemTypes[i] == 1) {
      workItemStr += `'${workItemTypeNames[i]}',`;
    }
  }
  workItemStr = workItemStr.slice(0, -1);
  workItemStr += ")";
  return workItemStr;
}

// Helper function to split an array into chunks
function chunkArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

// Function to query work items from Azure DevOps
async function queryWorkItems(
  accessToken,
  organizationName,
  projectName,
  areaPath,
  workItemTypeString
) {
  const apiUrl = `https://dev.azure.com/${organizationName}/${projectName}/_apis/wit/wiql?api-version=7.0`;
  try {
    // Make the WIQL query request
    const wiqlResponse = await axios.post(
      apiUrl,
      {
        query: `SELECT [System.Id]
                        FROM WorkItems
                        WHERE [System.WorkItemType] IN ${workItemTypeString}
                        AND [System.TeamProject] = '${projectName}'
                        AND [System.AreaPath] = '${areaPath}'
                        AND [System.State] <> 'Closed'
                        ORDER BY [System.State] ASC, [System.ChangedDate] DESC`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(":" + accessToken).toString(
            "base64"
          )}`,
        },
      }
    );

    const result = wiqlResponse.data;
    let ids = result.workItems.map((item) => item.id);

    // Handle case where no work items are found
    if (ids.length === 0) {
      console.log("No work items found.");
      return [];
    }

    // Split the IDs into batches of 200
    const chunks = chunkArray(ids, 200);

    const fields = ["System.Id", "System.Title", "System.State"];
    let allWorkItems = [];

    // Loop through each batch and make separate requests
    for (const chunk of chunks) {
      const workItemsResponse = await axios.get(
        `https://dev.azure.com/${organizationName}/_apis/wit/workitems?ids=${chunk.join(
          ","
        )}&fields=${fields.join(",")}&asOf=${result.asOf}&api-version=7.0`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(":" + accessToken).toString(
              "base64"
            )}`,
          },
        }
      );

      allWorkItems = allWorkItems.concat(workItemsResponse.data.value);
    }

    // Return the list of work items
    return allWorkItems;
  } catch (error) {
    console.error("Error querying work items:", error.message);
    return [];
  }
}

module.exports = { buildWorkItemTypeStr, queryWorkItems };
