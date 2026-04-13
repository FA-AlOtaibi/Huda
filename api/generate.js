export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { prompt, system } = req.body;
    // المفتاح الذي ستحصل عليه من Groq Console
    const apiKey = process.env.GROQ_API_KEY; 

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // سنستخدم Llama 3 70B لأنه الأقوى في التحليل الفقهي والأدبي
                model: "llama3-70b-8192", 
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: prompt }
                ],
                // إجبار النموذج على الرد بصيغة JSON
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0].message.content) {
            const aiResponse = JSON.parse(data.choices[0].message.content);
            return res.status(200).json(aiResponse);
        } else {
            throw new Error("Invalid response from Groq");
        }
    } catch (error) {
        console.error("Groq Error:", error);
        res.status(500).json({ error: "فشل الاستنباط عبر محرك Groq" });
    }
}
