import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { topic, difficulty, numberOfQuestions } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            // Fallback for demo if no key provided but we respect the requested topic and number of questions
            console.warn("No GEMINI_API_KEY found, returning dummy questions for topic:", topic);
            const dummyQuestions = Array.from({ length: numberOfQuestions || 5 }, (_, i) => ({
                question: `[Demo] Question ${i + 1} générée pour: ${topic} (Difficulté: ${difficulty})`,
                options: ["Option A (Fausse)", "Option B (Correcte)", "Option C (Fausse)", "Option D (Fausse)"],
                correctAnswer: "Option B (Correcte)",
                explanation: `Explication démo pour la question ${i + 1} sur ${topic}.`
            }));

            return NextResponse.json({
                questions: dummyQuestions
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Génère un quiz de ${numberOfQuestions} questions sur le sujet suivant : ${topic}. 
        Difficulté : ${difficulty}.
        Le format de sortie DOIT être un objet JSON valide avec une clé "questions" contenant un tableau d'objets.
        Chaque objet question doit avoir :
        - "question": la question posée
        - "options": un tableau de 4 options
        - "correctAnswer": la bonne réponse (doit être exactement l'une des options)
        - "explanation": une brève explication de la réponse.
        Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Nettoyage de la réponse au cas où le modèle ajoute des balises Markdown ```json
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const quizData = JSON.parse(cleanJson);

        return NextResponse.json(quizData);
    } catch (error: any) {
        console.error("AI Quiz Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
