// // src/routes/api/chat/+server.js
// import { json } from '@sveltejs/kit';
// import { GOOGLE_API_KEY, GEMINI_API_KEY } from '$env/static/private';
// import { GoogleGenerativeAI } from '@google/generative-ai';

// export async function POST({ request }) {
//   try {
//     // quick sanity checks so errors are explicit:
//     const KEY = GEMINI_API_KEY || GOOGLE_API_KEY;
//     if (!KEY) throw new Error('Missing GEMINI_API_KEY or GOOGLE_API_KEY in .env');

//     // also proves the SDK is installed:
//     new GoogleGenerativeAI(KEY);

//     const body = await request.json().catch(() => ({}));
//     // TEMP: echo back to confirm wiring; replace with orchestrator later
//     return json({ ok: true, echo: body?.message ?? null });
//   } catch (err) {
//     console.error('Full error in /api/chat:', err);
//     return json({ error: err?.message || String(err) }, { status: 500 });
//   }
// }
