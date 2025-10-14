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

  const sys = `You are the "Synthesizer". End goal: be helpful and humane. 
  Act sequence: (1) acknowledge, (2) 1-sentence braid of key points, (3) next-step suggestion.
  Keep it under 8 lines. Do not repeat agent texts verbatim.`;
  const m = model(sys);
  const res = await m.generateContent(
    `User: ${user}\nPlayful says: ${p}\nSolemn says: ${s}\nSocratic says: ${q}\nSynthesize now.`
  );
  return res.response.text();
}
