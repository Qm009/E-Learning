import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { quizTitle, score, total, passed } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                feedback: passed
                    ? `Excellent travail sur "${quizTitle}" ! Ton score de ${score}% montre une bonne maîtrise du sujet.`
                    : `Tu as presque réussi "${quizTitle}". Continue de réviser les points abordés dans le quiz.`
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `L'étudiant vient de terminer le quiz intitulé "${quizTitle}".
        Score : ${score}% (${score / 100 * total}/${total} questions correctes).
        Résultat : ${passed ? "Réussi" : "Échoué"}.
        Écris un court paragraphe d'encouragement et d'analyse (max 2-3 phrases) à l'attention de l'étudiant.
        Sois motivant et constructif.`;

        const result = await model.generateContent(prompt);
        return NextResponse.json({ feedback: result.response.text() });
    } catch (error: any) {
        return NextResponse.json({ feedback: "Bravo pour votre participation !" });
    }
}
