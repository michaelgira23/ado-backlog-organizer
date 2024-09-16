const OpenAI = require("openai");
const fs = require("fs");
require("dotenv").config();

(async () => {
  const openai = new OpenAI();

  // Read CSV
  const csv = fs.readFileSync("Feature-List.csv", "utf8");

  const systemPrompt =
    "You are helpful assistant tasked with assigning items to the relevant feature. Here are the features:" +
    csv;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: "Write a haiku about recursion in programming.",
      },
    ],
  });

  console.log(completion.choices[0].message);

  const { OpenAIClient } = require("@azure/openai");
  const { DefaultAzureCredential } = require("@azure/identity");

  async function main() {
    const endpoint = "https://myaccount.openai.azure.com/";
    const client = new OpenAIClient(endpoint, new DefaultAzureCredential());

    const deploymentId = "gpt-35-turbo";

    const messages = [
      {
        role: "user",
        content: "What's the most common customer feedback about our product?",
      },
    ];

    console.log(`Messages: ${messages.map((m) => m.content).join("\n")}`);

    const events = await client.streamChatCompletions(deploymentId, messages, {
      maxTokens: 128,
      azureExtensionOptions: {
        extensions: [
          {
            type: "AzureCognitiveSearch",
            endpoint: "<Azure Cognitive Search endpoint>",
            key: "<Azure Cognitive Search admin key>",
            indexName: "<Azure Cognitive Search index name>",
          },
        ],
      },
    });
    for await (const event of events) {
      for (const choice of event.choices) {
        const delta = choice.delta?.content;
        if (delta !== undefined) {
          console.log(`Chatbot: ${delta}`);
        }
      }
    }
  }

  main().catch((err) => {
    console.error("The sample encountered an error:", err);
  });
})();
