import { respond as playful } from "$lib/agents/PlayfulAgent";
import { respond as solemn } from "$lib/agents/SolemnAgent";
import { respond as socratic } from "$lib/agents/SocraticAgent";
import { model } from "$lib/llm/gemini";

export async function synthesize({ user, history }) {
  const [p, s, q] = await Promise.all([
    playful({ user, history }),
    solemn({ user, history }),
    socratic({ user, history })
  ]);

  const sys = `You are the "Synthesizer". Your goal is to create the most human-feeling response by drawing from the different agent perspectives.
  
  Guidelines:
  - Write as a caring, authentic human would respond
  - Blend the best insights from each agent naturally
  - Use natural, conversational language
  - Show empathy and understanding
  - Be genuine and relatable
  - Keep it concise but warm (under 8 lines)
  
  Do not simply summarize or repeat the agent outputs. Instead, synthesize them into a single, cohesive, human response.`;
  
  const m = model(sys);
  const res = await m.generateContent(
    `User: ${user}\n\nHere are different perspectives:\nPlayful approach: ${p}\nSolemn approach: ${s}\nSocratic approach: ${q}\n\nCreate the most human-feeling response by synthesizing these perspectives:`
  );
  return res.response.text();
}
