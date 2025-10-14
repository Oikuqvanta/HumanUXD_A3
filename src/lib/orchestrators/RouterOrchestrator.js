import { respond as playful } from "$lib/agents/PlayfulAgent";
import { respond as solemn } from "$lib/agents/SolemnAgent";
import { respond as socratic } from "$lib/agents/SocraticAgent";
import { synthesize } from "$lib/orchestrators/SynthesizerOrchestrator.js";
import { model } from "$lib/llm/gemini";

function ruleRoute(utterance) {
  const u = utterance.toLowerCase();
  
  // Everyday questions - use fallback (synthesizer)
  if (u.match(/what.*lunch|what.*dinner|what.*eat|what.*food|hungry|food|meal/)) {
    return "synthesizer";
  }
  
  // Negative emotions - use fallback (synthesizer)
  if (u.match(/sad|depressed|upset|angry|frustrated|stressed|worried|anxious|tired|exhausted|overwhelmed|disappointed|hurt|lonely|scared|fear/)) {
    return "synthesizer";
  }
  
  // Clear cases for individual agents
  if (u.includes("why") || u.endsWith("?")) return "socratic";
  if (u.match(/lol|haha|:-\)|😀|😄|fun|happy|excited|great|awesome/)) return "playful";
  
  // Only use solemn for very serious topics (reduced frequency)
  if (u.match(/death|grief|loss|trauma|abuse|violence|suicide|self-harm|emergency|urgent|critical/)) {
    return "solemn";
  }
  
  return null;
}

export async function route({ user, history }) {
  const byRule = ruleRoute(user);
  if (byRule) {
    // Handle synthesizer case (fallback for everyday questions and negative emotions)
    if (byRule === 'synthesizer') {
      const text = await synthesize({ user, history });
      const reasons = user.toLowerCase().match(/what.*lunch|what.*dinner|what.*eat|what.*food|hungry|food|meal/) 
        ? 'Everyday question - using multi-agent synthesis (rule-based)'
        : 'Negative emotions detected - using multi-agent synthesis (rule-based)';
      return { picked: 'synthesizer', text, reasons };
    }
    
    const map = { playful, solemn, socratic: socratic };
    const reasons = byRule === 'socratic' ? 'User asked a question (rule-based)' :
                   byRule === 'playful' ? 'User used casual/humorous language (rule-based)' :
                   'User mentioned serious topics (rule-based)';
    return { picked: byRule, text: await map[byRule]({ user, history }), reasons };
  }

  // LLM triage if rules don't catch - prefer synthesizer for ambiguous cases
  const triage = await model("You classify user messages into playful|socratic|synthesizer and provide brief reasoning. Use synthesizer for everyday questions, emotional support, or ambiguous cases. Only use playful/socratic for very clear cases. Respond in format: LABEL: reasoning").generateContent(
    `User: ${user}\nClassify as playful, socratic, or synthesizer. Use synthesizer for everyday questions, emotional support, or when unsure. Explain why in one sentence.`
  );
  
  const response = triage.response.text().toLowerCase();
  let label;
  if (response.includes("synthesizer")) {
    label = "synthesizer";
  } else if (response.includes("socratic")) {
    label = "socratic";
  } else {
    label = "playful";
  }

  // Handle synthesizer case
  if (label === "synthesizer") {
    const text = await synthesize({ user, history });
    const reasons = triage.response.text().trim();
    return { picked: 'synthesizer', text, reasons };
  }

  const map = { playful, socratic: socratic };
  const reasons = triage.response.text().trim();
  return { picked: label, text: await map[label]({ user, history }), reasons };
}
