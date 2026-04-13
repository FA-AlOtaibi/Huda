export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { prompt, system } = req.body;
    
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: system + "\nIMPORTANT: Never invent a Hadith. If you don't find a direct text in Bukhari, Muslim or famous Fiqh books, state that clearly." },
                    { role: "user", content: prompt }
                ],
                temperature: 0, // صفر يعني دقة قصوى وعدم تأليف
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        res.status(200).json(JSON.parse(data.choices[0].message.content));
    } catch (error) {
        res.status(500).json({ error: "خطأ في الخادم" });
    }
}
