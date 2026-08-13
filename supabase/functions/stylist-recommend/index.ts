import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const { skinTone, bodyShape, height, styleVibe, occasion, ruleBasedResult } = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      // Graceful fallback when API key is not configured
      return jsonResponse({
        data: {
          narrative: null,
          source: 'rule-based-fallback',
          message: 'LLM API Key belum dikonfigurasi. Menggunakan analisis rule-based.'
        }
      });
    }

    // Call Gemini API if GEMINI_API_KEY is available
    if (Deno.env.get('GEMINI_API_KEY')) {
      const prompt = `Kamu adalah AI Fashion Stylist profesional untuk CIRCULAI (platform fashion berkelanjutan Indonesia).
Pengguna mengisi kuis gaya dengan profil:
- Warna Kulit: ${skinTone || 'tidak ditentukan'}
- Bentuk Tubuh: ${bodyShape || 'tidak ditentukan'}
- Tinggi Badan: ${height || 'tidak ditentukan'}
- Preferensi Gaya: ${Array.isArray(styleVibe) ? styleVibe.join(', ') : styleVibe || 'Clean Casual'}
- Kebutuhan/Acara: ${Array.isArray(occasion) ? occasion.join(', ') : occasion || 'Daily Wear'}

Hasil rekomendasi sistem:
- Archetype: ${ruleBasedResult?.archetype || 'The Circular Stylist'}
- Rekomendasi Potongan: ${(ruleBasedResult?.cuttings || []).join(', ')}
- Kain Direkomendasikan: ${(ruleBasedResult?.fabrics || []).join(', ')}

Tugasmu: Buatkan narasi analisis gaya personal singkat dalam 2 paragraf bahasa Indonesia yang hangat, profesional, dan inspiratif.
Jelaskan ALASAN mengapa kombinasi potongan dan kain di atas cocok dengan profil mereka, serta berikan 1 saran padu-padan (mix-and-match) praktis.
Respons harus dalam JSON dengan format persis:
{"narrative": "teks narasi di sini"}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );

      if (res.ok) {
        const resultJson = await res.json();
        const rawText = resultJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          try {
            const parsed = JSON.parse(rawText);
            return jsonResponse({
              data: {
                narrative: parsed.narrative,
                source: 'gemini-llm'
              }
            });
          } catch {
            return jsonResponse({
              data: {
                narrative: rawText,
                source: 'gemini-llm'
              }
            });
          }
        }
      }
    }

    // Fallback if API call did not succeed
    return jsonResponse({
      data: {
        narrative: null,
        source: 'rule-based-fallback'
      }
    });
  } catch (error) {
    return jsonResponse({
      data: {
        narrative: null,
        error: error instanceof Error ? error.message : 'Internal error'
      }
    });
  }
});
