import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
    // CORS Headers
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    };

    if (req.method === "OPTIONS") return new Response("ok", { headers });

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: { headers: { Authorization: req.headers.get("Authorization")! } },
            }
        );

        // Verify user
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error("Non autorisé");

        // Vérifier rôle professeur
        const { data: profile } = await supabaseClient.from("profiles").select("role").eq("id", user.id).single();
        if (profile?.role !== 'teacher') throw new Error("Seuls les professeurs peuvent générer des Quiz.");

        const { topic, numberOfQuestions, difficulty } = await req.json();

        if (!openAiApiKey) throw new Error("Clé API OpenAI manquante.");

        // Prompt pour l'IA
        const prompt = `Génère un quiz QCM de ${numberOfQuestions || 5} questions sur le sujet : "${topic}" au niveau ${difficulty || 'moyen'}. 
    Retourne STRICTEMENT un objet JSON valide avec cette structure, sans aucun texte ou markdown autour :
    [
      {
        "question": "Texte de la question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option B",
        "explanation": "Brève explication de pourquoi c'est la bonne réponse."
      }
    ]`;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${openAiApiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            }),
        });

        const aiData = await response.json();
        let questions;

        try {
            questions = JSON.parse(aiData.choices[0].message.content);
        } catch (e) {
            throw new Error("L'IA n'a pas renvoyé le format JSON attendu");
        }

        return new Response(JSON.stringify({ questions }), {
            headers: { ...headers, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...headers, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
