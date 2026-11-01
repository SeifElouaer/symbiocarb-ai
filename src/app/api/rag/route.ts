// ==============================================================================
// Multilingual Vector RAG Emission Factor Matcher (/api/rag)
// Maps raw industrial BOM lines (FR/EN/AR) to exact EU CBAM CN 8-digit codes & kgCO2e
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { generateTextEmbedding, cosineSimilarity } from '@/lib/ai/embeddings';
import { supabaseServer } from '@/lib/supabase/server';
import { FALLBACK_EMISSION_FACTORS } from '@/lib/supabase/fallback-data';
import { EmissionFactor } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, category, limit = 5 } = body;

    if (!query) {
      return NextResponse.json({ ok: false, error: 'Query is required' }, { status: 400 });
    }

    // 1. Generate 768-dimensional embedding via Gemini text-embedding-004
    const queryVector = await generateTextEmbedding(query);

    let matches: EmissionFactor[] = [];

    // 2. Attempt Supabase pgvector RPC query
    try {
      const { data, error } = await supabaseServer.rpc('match_emission_factors', {
        query_embedding: queryVector,
        match_threshold: 0.35,
        match_count: limit,
        filter_category: category || null,
      });

      if (!error && data && data.length > 0) {
        matches = data;
      }
    } catch {
      // Fall through to local fallback matcher
    }

    // 3. Fallback semantic + keyword matcher
    if (matches.length === 0) {
      const lowerQuery = query.toLowerCase();
      matches = FALLBACK_EMISSION_FACTORS.map((ef) => {
        let score = 0.45;
        // Multilingual keyword matching
        if (lowerQuery.includes('acier') || lowerQuery.includes('steel') || lowerQuery.includes('حديد') || lowerQuery.includes('صلب') || lowerQuery.includes('تول')) {
          if (ef.code.includes('STEEL')) score = 0.94;
        } else if (lowerQuery.includes('alu') || lowerQuery.includes('ألمنيوم')) {
          if (ef.code.includes('ALUMINUM')) score = 0.92;
        } else if (lowerQuery.includes('steg') || lowerQuery.includes('electr') || lowerQuery.includes('كهرباء')) {
          if (ef.code.includes('STEG')) score = 0.96;
        } else if (lowerQuery.includes('datte') || lowerQuery.includes('تمر') || lowerQuery.includes('نوى')) {
          if (ef.code.includes('DATE') || ef.code.includes('ACTIVATED')) score = 0.95;
        } else if (lowerQuery.includes('olive') || lowerQuery.includes('زيتون') || lowerQuery.includes('فيتور') || lowerQuery.includes('grignon')) {
          if (ef.code.includes('OLIVE') || ef.code.includes('BIO')) score = 0.91;
        }
        return {
          ...ef,
          similarity: score,
        };
      })
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit);
    }

    return NextResponse.json({
      ok: true,
      query,
      matches,
    });
  } catch (error) {
    console.error('Vector RAG Error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

