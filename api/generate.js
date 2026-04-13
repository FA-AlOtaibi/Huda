export default async function handler(req, res) {
    // استقبال البيانات من الموقع
    const { prompt, system } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; 

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Instructions: ${system}\n\nUser: ${prompt}` }] }],
                generationConfig: { 
                    responseMimeType: "application/json",
                    temperature: 0.7 
                }
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            let aiText = data.candidates[0].content.parts[0].text;
            // تنظيف النص من أي علامات Markdown قد يضيفها الذكاء الاصطناعي
            aiText = aiText.replace(/```json|```/g, "").trim();
            res.status(200).json(JSON.parse(aiText));
        } else {
            throw new Error("Invalid AI response");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "فشل في جلب البيانات من الخادم" });
    }
}
