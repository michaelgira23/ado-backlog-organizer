const { OpenAI } = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const { z } = require("zod");

const client = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

const outputSchema = z.object({
  results: z.array(
    z.object({
      explanation: z.string(),
      name: z.string(),
      id: z.number(),
      nevermind: z.boolean(),
    })
  ),
});

async function findSimilarWorkItems(needle, haystack) {
  const systemPrompt = `You are the best PM at Microsoft, and your job is to suggest the relevant work items to be the parent for orphaned work items. The user will give you a list of all possible features in an Azure DevOps backlog, and your job is to select the most relevant parent features for which this orphaned work item should belong to.

Return a JSON list of 3-5 of the most relevant work items from the list, in order from most relevant to least relevant. Each work item should have the following fields: ID, Name, and Explanation. The Explanation field should contain a brief explanation of why the work item is relevant to the orphaned work item.

Only include relevant work item suggestions. Do not suggestion anything irrelevant. If you cannot find any relevant work items, return an empty list. These results will be shown as search results for the user, so most relevant items should be listed first, and any unnecessary or inaccurate suggestions will overwhelm and confuse the user. A useful heuristic is that if your explanation is too far-fetched, you should not include it in the results. If that is the case, you can cancel displaying this search result by setting nevermind: true.`;

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
    response_format: zodResponseFormat(outputSchema, "results"),
  });

  const output = completion.choices[0].message;

  if (output.refusal) {
    throw new Error(output.refusal);
  }

  if (output.parsed) {
    console.log("output.parsed.results", output.parsed.results);
    return output.parsed.results
      .filter((item) => !item.nevermind)
      .map((item) => item.id)
      .map((id) => haystack.find((item) => item.id === id));
  }

  throw new Error("No results found.");
}

module.exports = { findSimilarWorkItems };
