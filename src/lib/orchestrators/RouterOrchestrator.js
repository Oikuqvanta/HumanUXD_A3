import { respond as playful } from "$lib/agents/PlayfulAgent";
import { respond as solemn } from "$lib/agents/SolemnAgent";
import { respond as socratic } from "$lib/agents/SocraticAgent";
import { model } from "$lib/llm/gemini";

function ruleRoute(utterance) {
  const u = utterance.toLowerCase();
  if (u.includes("why") || u.endsWith("?")) return "socratic";
  if (u.match(/lol|haha|:-\)|😀|😄/)) return "playful";
  if (u.match(/serious|important|respect|concern/)) return "solemn";
  return null;
}

export async function route({ user, history }) {
  const byRule = ruleRoute(user);
  if (byRule) {
    const map = { playful, solemn, socratic: socratic };
    return { picked: byRule, text: await map[byRule]({ user, history }) };
  }

  // LLM triage if rules don't catch
  const triage = await model("You classify user messages into playful|solemn|socratic").generateContent(
    `User: ${user}\nPick exactly one label: playful, solemn, or socratic.`
  );
  const label = triage.response.text().toLowerCase().includes("solemn")
    ? "solemn"
    : triage.response.text().toLowerCase().includes("socratic")
      ? "socratic" : "playful";

  const map = { playful, solemn, socratic };
  return { picked: label, text: await map[label]({ user, history }) };
}
