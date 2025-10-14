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
    const reasons = byRule === 'socratic' ? 'User asked a question (rule-based)' :
                   byRule === 'playful' ? 'User used casual/humorous language (rule-based)' :
                   'User mentioned serious topics (rule-based)';
    return { picked: byRule, text: await map[byRule]({ user, history }), reasons };
  }

  // LLM triage if rules don't catch
  const triage = await model("You classify user messages into playful|solemn|socratic and provide brief reasoning. Respond in format: LABEL: reasoning").generateContent(
    `User: ${user}\nClassify as playful, solemn, or socratic and explain why in one sentence.`
  );
  
  const response = triage.response.text().toLowerCase();
  const label = response.includes("solemn")
    ? "solemn"
    : response.includes("socratic")
      ? "socratic" : "playful";

  const map = { playful, solemn, socratic };
  const reasons = triage.response.text().trim();
  return { picked: label, text: await map[label]({ user, history }), reasons };
}
