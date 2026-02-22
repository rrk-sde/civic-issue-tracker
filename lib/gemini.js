import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateGeminiContent(prompt, systemPrompt = "", jsonMode = false, modelName = "gemini-2.5-flash", base64Image = null, mimeType = "image/jpeg") {
    if (!genAI || !process.env.GEMINI_API_KEY) throw new Error("Gemini API Key not found");

    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: jsonMode ? "application/json" : "text/plain" }
        });

        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const parts = [fullPrompt];

        if (base64Image) {
            parts.push({
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            });
        }

        const result = await model.generateContent(parts);
        return result.response.text();
    } catch (error) {
        console.error(`Gemini Error (${modelName}):`, error.message);

        // Fallback strategy
        if (modelName === "gemini-2.5-flash") {
            console.log("Attempting fallback to gemini-2.0-flash...");
            return await generateGeminiContent(prompt, systemPrompt, jsonMode, "gemini-2.0-flash", base64Image, mimeType);
        } else if (modelName === "gemini-2.0-flash") {
            console.log("Attempting fallback to gemini-2.5-pro...");
            return await generateGeminiContent(prompt, systemPrompt, jsonMode, "gemini-2.5-pro", base64Image, mimeType);
        }

        throw error;
    }
}
