import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

// PDF parsing (lightweight text extraction)
function extractTextFromPDF(data: Uint8Array): string {
  const decoder = new TextDecoder("utf-8");
  const buffer = data.buffer;
  const view = new Uint8Array(buffer);
  let pdfText = '';
  let i = 0;

  // Simple PDF text extraction (for demo; use full lib in prod)
  while (i < view.length - 5) {
    if (view[i] === 0x28 && view[i+1] !== 0x29) { // Look for (
      let end = i + 2;
      while (end < view.length && view[end] !== 0x29) end++;
      if (end < view.length) {
        const text = decoder.decode(view.slice(i + 1, end));
        if (!text.includes('/')) pdfText += text + ' ';
      }
      i = end + 1;
    } else {
      i++;
    }
  }
  return pdfText.trim().substring(0, 3000); // Limit context
}

// DOCX extraction (very basic)
function extractTextFromDOCX(data: Uint8Array): string {
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(data);
  const matches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (!matches) return '';
  return matches
    .map(m => m.replace(/<.*?>/g, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 3000);
}

// Call OpenRouter
async function callOpenRouter(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://stackblitz.com',
      'X-Title': 'LearnLift AI Study Assistant'
    },
    body: JSON.stringify({
      model: "qwen/qwen2-235b-a22b-2507:free",
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000
    })
  });

  if (!response.ok) throw new Error(`OpenRouter error: ${await response.text()}`);
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// Parse JSON from AI response
function parseJSONSafely(str: string): any {
  try {
    // Clean code blocks
    let clean = str.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7, -3);
    if (clean.startsWith('```')) clean = clean.slice(3, -3);
    return JSON.parse(clean);
  } catch (e) {
    console.error('JSON parse error:', e, str);
    return null;
  }
}

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  );

  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
  if (!OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenRouter API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { document_id } = await req.json();

    // Fetch file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(`${user.id}/${document_id}`);

    if (downloadError) {
      return new Response(JSON.stringify({ error: downloadError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const fileName = fileData.headers.get('x-amz-meta-original-name') || 'unknown';
    const fileType = fileName.split('.').pop()?.toLowerCase();

    let textContent = '';
    if (fileType === 'pdf') {
      textContent = extractTextFromPDF(uint8Array);
    } else if (fileType === 'docx') {
      textContent = extractTextFromDOCX(uint8Array);
    } else {
      textContent = new TextDecoder().decode(uint8Array).substring(0, 3000);
    }

    if (!textContent.trim()) {
      return new Response(JSON.stringify({ error: 'No readable text content' }), {
        status: 400
      });
    }

    // Extract concepts
    const conceptPrompt = `
Extract 3-5 key concepts from this text. For each concept provide:
- A short title (max 50 characters)
- A brief explanation (2-3 sentences)
- Importance (high/medium/low)

Respond with a JSON array only:
[
  {
    "title": "Concept Title",
    "explanation": "Brief explanation",
    "importance": "high"
  }
]

Text: ${textContent}
    `;

    const conceptResponse = await callOpenRouter(conceptPrompt, OPENROUTER_API_KEY);
    const concepts = parseJSONSafely(conceptResponse);
    
    if (concepts && Array.isArray(concepts)) {
      for (const concept of concepts) {
        await supabaseClient.from('concepts').insert({
          document_id,
          title: concept.title,
          explanation: concept.explanation,
          importance: concept.importance || 'medium'
        });
      }
    }

    // Generate flashcards
    const flashcardPrompt = `
Create 2-3 flashcards for this concept list:
${JSON.stringify(concepts?.slice(0, 2) || [], null, 2)}

Rules:
- Questions should test understanding
- Answers should be concise
- Avoid definition questions

Respond with JSON:
[
  { "question": "...", "answer": "..." }
]
    `;

    const flashcardResponse = await callOpenRouter(flashcardPrompt, OPENROUTER_API_KEY);
    const flashcards = parseJSONSafely(flashcardResponse);

    if (flashcards && Array.isArray(flashcards)) {
      for (const card of flashcards) {
        await supabaseClient.from('flashcards').insert({
          document_id,
          question: card.question,
          answer: card.answer,
          difficulty: 1.0
        });
      }
    }

    // Mark document as processed
    await supabaseClient.from('documents')
      .update({ processed: true, ai_model_used: 'qwen2-235b' })
      .eq('id', document_id);

    return new Response(JSON.stringify({
      status: 'success',
      concepts: concepts?.length || 0,
      flashcards: flashcards?.length || 0
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
