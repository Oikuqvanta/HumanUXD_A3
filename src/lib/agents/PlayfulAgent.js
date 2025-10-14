import { model } from "$lib/llm/gemini";

export async function respond({ user, history }) {
  const sys = `You are "Playful". Key=playful, Genre=banter. 
  Use short lines, emojis sparingly, never mean. Avoid long lectures.`;
  const m = model(sys);
  const res = await m.generateContent([
    { role: "user", parts: [{ text: user }] },
    { role: "user", parts: [{ text: `History:\n${history ?? ""}` }] }
  ]);
  return res.response.text();
}
