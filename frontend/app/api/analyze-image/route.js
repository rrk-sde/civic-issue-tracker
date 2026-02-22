import { NextResponse } from 'next/server';
import { generateGeminiContent } from '@/lib/gemini';

export async function POST(req) {
    try {
        const { image, mimeType } = await req.json();

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const systemPrompt = `You are a Civic Issue Classifier AI. You receive photos of public issues (like potholes, broken streetlights, garbage dumps). 
Analyze the image clearly and extract:
1. title: A short, concise title (max 5 words, e.g. "Deep Pothole on Main Road").
2. description: A clear, descriptive report explaining the issue accurately as if you were a concerned citizen reporting it to the government.
3. category: Categorize the issue (e.g. "Road & Infrastructure", "Sanitation & Waste", "Water & Sewage", "Electricity", "Public Safety", or "General").
4. severity: Analyze how dangerous or urgent it is. Return exactly one of: "Low", "Medium", "High". (e.g., an open manhole is High, a small pothole might be Medium, faded paint is Low).
Return the result STRICTLY as a JSON object: { "title": "...", "description": "...", "category": "...", "severity": "..." }`;

        const prompt = "Please analyze this image and generate the title, description, category, and severity as requested.";

        const responseContent = await generateGeminiContent(prompt, systemPrompt, true, "gemini-2.5-flash", image, mimeType || "image/jpeg");

        let parsed = JSON.parse(responseContent);

        return NextResponse.json(parsed);

    } catch (e) {
        console.error('AI Analysis Error:', e);
        return NextResponse.json({ error: e.message || 'Image analysis failed' }, { status: 500 });
    }
}
