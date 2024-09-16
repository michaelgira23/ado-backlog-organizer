const fs = require("fs");
const { OpenAI, AzureOpenAI, AzureKeyCredential } = require("openai");
require("dotenv").config({ path: "../.env" });

// Read CSV
const csv = fs.readFileSync("Feature_List.csv", "utf8");

const systemPrompt =
  "You are helpful assistant tasked with assigning items to the relevant feature. Here are the features:\n" +
  csv;

const taskName = "Fix bug in vscode.dev";

const userMessage = `Please suggest 1-3 parent features for the following product work item: '${taskName}'`;

async function main() {
  // Object.keys(process.env)
  //   .filter((key) => key.includes("AZURE"))
  //   .forEach((key) => console.log(`${key}: '${process.env[key]}'`));

  // const client = new AzureOpenAI({
  //   apiKey: process.env.AZURE_OPENAI_API_KEY,
  //   apiVersion: "2023-03-15-preview", // Ensure this matches the correct API version
  //   baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  //   deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
  // });

  const client = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
  });

  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });

  console.log(completion.choices[0].message);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
