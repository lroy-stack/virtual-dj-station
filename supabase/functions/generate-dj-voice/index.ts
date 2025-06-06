
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DJRequest {
  type: 'track_intro' | 'track_outro' | 'general';
  track?: any;
  context?: string;
  personality: 'enthusiastic' | 'friendly' | 'professional' | 'casual';
  voice_id: string;
  user_profile?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { type, track, context, personality, voice_id, user_profile }: DJRequest = await req.json();

    // Generate appropriate text based on type and personality
    let text = '';
    
    const personalityStyles = {
      enthusiastic: {
        greetings: ['¡Qué tal!', '¡Genial!', '¡Increíble!'],
        transitions: ['¡Y ahora', 'Siguiente viene', '¡Prepárense para'],
        endings: ['¡Disfruten!', '¡A bailar!', '¡Que lo pasen genial!']
      },
      friendly: {
        greetings: ['Hola', 'Buenas', 'Qué tal'],
        transitions: ['Ahora escuchamos', 'Aquí tenemos', 'Les traemos'],
        endings: ['Espero que les guste', 'Disfruten', 'Un saludo']
      },
      professional: {
        greetings: ['Buenos días', 'Buenas tardes', 'Saludos'],
        transitions: ['A continuación', 'Escucharemos ahora', 'Presentamos'],
        endings: ['Gracias por sintonizarnos', 'Continúen con nosotros', 'Les saluda su DJ']
      },
      casual: {
        greetings: ['Hey', 'Ey', 'Qué pasa'],
        transitions: ['Va esta', 'Aquí va', 'Escuchen esto'],
        endings: ['Nos vemos', 'Hasta luego', 'Seguimos']
      }
    };

    const style = personalityStyles[personality];

    switch (type) {
      case 'track_intro':
        if (track) {
          const greeting = style.greetings[Math.floor(Math.random() * style.greetings.length)];
          const transition = style.transitions[Math.floor(Math.random() * style.transitions.length)];
          text = `${greeting}! ${transition} "${track.title}" de ${track.artist}`;
          if (track.album) {
            text += ` del álbum "${track.album}"`;
          }
        }
        break;
        
      case 'track_outro':
        if (track) {
          const ending = style.endings[Math.floor(Math.random() * style.endings.length)];
          text = `Eso fue "${track.title}" de ${track.artist}. ${ending}`;
        }
        break;
        
      case 'general':
        const greeting = style.greetings[Math.floor(Math.random() * style.greetings.length)];
        const ending = style.endings[Math.floor(Math.random() * style.endings.length)];
        text = context || `${greeting}! Están escuchando Radio IA. ${ending}`;
        break;
    }

    if (!text) {
      throw new Error('Could not generate text for announcement');
    }

    // Call ElevenLabs API
    const elevenlabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Use default voice if none specified
    const voiceToUse = voice_id && voice_id !== 'default' ? voice_id : 'EXAVITQu4vr4xnSDxMaL';

    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceToUse}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenlabsApiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!elevenlabsResponse.ok) {
      throw new Error(`ElevenLabs API error: ${elevenlabsResponse.status}`);
    }

    const audioBuffer = await elevenlabsResponse.arrayBuffer();
    
    // Convert to base64 for easier handling
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return new Response(
      JSON.stringify({ 
        audio_url: audioUrl,
        text: text,
        voice_id: voiceToUse
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-dj-voice function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate DJ voice announcement'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
