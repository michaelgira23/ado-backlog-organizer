const { findSimilarWorkItems } = require("./findSimilarWorkItems");

async function main() {
  const needle = "Fix axios vulnerability";
  const haystack = [
    {
      id: "26956368",
      name: "Stop Storing PUID Globally",
      link: "https://dev.azure.com/AdoBacklogOrganizer/AdoBacklogAgile/_workitems/edit/26956368",
    },
    {
      id: "28934734",
      name: "Outstanding Serial Console Security Wave 1 Items",
      link: "https://dev.azure.com/AdoBacklogOrganizer/AdoBacklogAgile/_workitems/edit/26956368",
    },
    {
      id: "28609089",
      name: "New Cloud Shell RP Service",
      link: "https://dev.azure.com/AdoBacklogOrganizer/AdoBacklogAgile/_workitems/edit/26956368",
    },
  ];

  const results = await findSimilarWorkItems(needle, haystack);
  console.log("results", results);
}

main().catch((err) => {
  console.error("Encountered an error:", err);
});
