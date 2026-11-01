/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client (fails gracefully if API key is not present)
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiAvailable: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// AI endpoint: Generate concise tourist description for a city stop
app.post('/api/ai/describe-city', async (req: Request, res: Response) => {
  try {
    const { cityName, country } = req.body;
    if (!cityName) {
      return res.status(400).json({ error: 'cityName is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        description: `Hermosa ciudad de ${cityName}${country ? `, ${country}` : ''}, caracterizada por su rica herencia cultural, sitios icónicos y un ambiente acogedor para descubrir.`,
        source: 'fallback',
      });
    }

    const prompt = `Actúa como redactor turístico profesional para la agencia "Tresor Travel".
Escribe una breve descripción atractiva, refinada y concisa (alrededor de 35-45 palabras) en español para presentar la ciudad de "${cityName}"${country ? ` (${country})` : ''} en la primera jornada de llegada de un itinerario turístico.
Destaca sus atractivos emblemáticos o su personalidad turística. Responde únicamente con el texto continuo sin viñetas ni asteriscos de markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const description = response.text?.trim() || `Una ciudad llena de encanto, historia y atractivos por explorar.`;
    return res.json({ description, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/ai/describe-city:', error);
    return res.json({
      description: `Fascinante destino con gran patrimonio cultural, arquitectura singular y pintorescos paseos ideales para recorrer.`,
      source: 'fallback',
    });
  }
});

// AI endpoint: Suggest popular excursions for any destination
app.post('/api/ai/suggest-excursions', async (req: Request, res: Response) => {
  try {
    const { cityName, country } = req.body;
    if (!cityName) {
      return res.status(400).json({ error: 'cityName is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        excursions: [
          `City Tour panorámico por los principales atractivos de ${cityName}`,
          `Visita guiada a pie por los barrios históricos`,
          `Excursión cultural y gastronómica destacada`,
        ],
        source: 'fallback',
      });
    }

    const prompt = `Menciona 4 de las excursiones o visitas turísticas más emblemáticas para realizar en la ciudad de "${cityName}"${country ? ` (${country})` : ''}.
Responde estrictamente con un JSON array de strings con los títulos de las excursiones en español (máximo 8 palabras por excursión).
Ejemplo: ["City Tour histórico con paradas panorámicas", "Visita guiada a museos destacados", "Paseo en barco por la bahía", "Excursión de día completo en los alrededores"]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let excursions: string[] = [];
    try {
      excursions = JSON.parse(response.text || '[]');
      if (!Array.isArray(excursions) || excursions.length === 0) {
        throw new Error('Invalid array response');
      }
    } catch {
      excursions = [
        `City Tour panorámico por ${cityName}`,
        `Visita guiada a los principales monumentos históricos`,
        `Recorrido cultural y gastronómico`,
      ];
    }

    return res.json({ excursions, source: 'gemini' });
  } catch (error: any) {
    console.error('Error in /api/ai/suggest-excursions:', error);
    return res.json({
      excursions: [
        `City Tour guiado por los principales atractivos`,
        `Visita histórica y paseo por la ciudad`,
        `Excursión panorámica opcional`,
      ],
      source: 'fallback',
    });
  }
});

// Setup Vite development middleware or static file serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
