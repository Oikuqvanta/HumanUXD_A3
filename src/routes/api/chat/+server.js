import { json } from '@sveltejs/kit';
import { route } from '$lib/orchestrators/RouterOrchestrator.js';

/**
 * Handle chat POST requests for a single-turn pipeline execution.
 *
 * Parameters: ({ request }) SvelteKit request wrapper.
 * Returns: JSON response with pipeline output or error.
 */
export async function POST({ request }) {
  const body = await request.json();
  const { history } = body || {};

  if (!Array.isArray(history)) {
    return json({ error: 'history array is required' }, { status: 400 });
  }

  try {
    // Get the latest user message
    const latestMessage = history[history.length - 1];
    if (!latestMessage || latestMessage.role !== 'user') {
      return json({ error: 'No user message found' }, { status: 400 });
    }

    const userMessage = latestMessage.content;
    const historyText = history.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n');
    
    const result = await route({ user: userMessage, history: historyText });
    
    return json({ 
      assistantMessage: result.text, 
      replierInput: { 
        frameSet: { frames: { persona: { value: result.picked, rationale: [result.reasons || 'Router-based selection'] } } }, 
        contextCount: history.length, 
        agent: result.picked, 
        reasons: result.reasons || 'Router-based agent selection' 
      } 
    });
  } catch (err) {
    const msg = String(err?.message || err || '').toLowerCase();
    if (msg.includes('gemini_api_key') || msg.includes('gemini') || msg.includes('api key')) {
      return json({ error: 'Gemini API key not found' }, { status: 400 });
    }
    return json({ error: 'Pipeline error', details: String(err?.message || err) }, { status: 500 });
  }
}
