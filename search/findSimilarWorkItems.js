const { OpenAI } = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const { z } = require("zod");

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

const outputSchema = z.object({
  ids: z.array(z.number()),
});

async function findSimilarWorkItems(needle, haystack) {
  const systemPrompt =
    "You are the best PM at Microsoft, and your job is to suggest the relevant work items to be the parent for orphaned work items. The user will give you a list of all possible features in an Azure DevOps backlog, and your job is to select the most relevant parent features for which this orphaned work item should belong to. Return a JSON list of 3-5 of the most relevant work item IDs from the list.";

  const userMessage = `Here are the existing features in my backlog:\n\n${haystack
    .map((item) => `- ID: "${item.id}", Name: "${item.fields["System.Title"]}"`)
    .join(
      "\n"
    )}\n\nWhich of these features should be the parent of a work item named "${needle}"?`;

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

  const completion = await client.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages,
    response_format: zodResponseFormat(outputSchema, "ids"),
  });

  const output = completion.choices[0].message.parsed;
  return haystack.filter((item) => output.ids.includes(item.id));
}

module.exports = { findSimilarWorkItems };
