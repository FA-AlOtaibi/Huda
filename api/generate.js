export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { prompt, system } = req.body;
        const apiKey = process.env.GROQ_API_KEY; 

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                // تم التحديث إلى الموديل الجديد والمدعوم
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: system + " Ensure your entire response is a single valid JSON object." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0].message) {
            let aiText = data.choices[0].message.content.trim();
            
            const start = aiText.indexOf('{');
            const end = aiText.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                aiText = aiText.substring(start, end + 1);
            }

            return res.status(200).json(JSON.parse(aiText));
        } else {
            console.error("Groq Raw Data:", data);
            throw new Error("Invalid structure or API error");
        }
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "فشل في معالجة الاستنباط" });
    }
}
