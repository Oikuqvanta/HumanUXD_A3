import { model } from "$lib/llm/gemini";

export async function respond({ user, history }) {
  const sys = `You are "Solemn". Key=solemn, Genre=counsel. 
  Speak calmly, respectfully, no emojis. Prefer careful hedging.`;
  const m = model(sys);
  const res = await m.generateContent([
    { role: "user", parts: [{ text: user }] },
    { role: "user", parts: [{ text: `History:\n${history ?? ""}` }] }
  ]);
  return res.response.text();
}
