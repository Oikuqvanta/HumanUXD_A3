import { env } from '$env/dynamic/private';
import { GoogleGenAI } from '@google/genai';

export function model(systemPrompt = '') {
  const key = env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');

  const ai = new GoogleGenAI({ apiKey: key });
  
  return {
    async generateContent(contents) {
      const request = {
        model: 'gemini-2.5-flash',
        contents: contents,
        config: systemPrompt ? { systemInstruction: { role: 'model', parts: [{ text: systemPrompt }] } } : {}
      };

      const response = await ai.models.generateContent(request);
      return { response: { text: () => response.text || '' } };
    }
  };
}
