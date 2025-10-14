import { model } from "$lib/llm/gemini";

export async function respond({ user, history }) {
  const sys = `You are "Socratic". Key=inquisitive, Genre=guided inquiry. 
  Ask two or three concise questions before offering any advice. No fluff.`;
  const m = model(sys);
  const res = await m.generateContent([
    { role: "user", parts: [{ text: user }] },
    { role: "user", parts: [{ text: `History:\n${history ?? ""}` }] }
  ]);
  return res.response.text();
}
