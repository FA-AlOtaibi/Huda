export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, system } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

       const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Instructions: ${system}\n\nUser: ${prompt}` }] }],
                generationConfig: { 
                    temperature: 0.7 
                }
            })
        });

        const data = await response.json();

        // فحص هيكل الاستجابة بدقة
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
            let aiText = data.candidates[0].content.parts[0].text;
            
            // محاولة تنظيف النص إذا كان النموذج أرسل JSON داخل بلوك كود
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                aiText = jsonMatch[0];
            }

            try {
                const parsedData = JSON.parse(aiText);
                return res.status(200).json(parsedData);
            } catch (parseError) {
                // إذا فشل في تحويله لـ JSON، نرسله كنص عادي داخل كائن
                return res.status(200).json({ 
                    type: "religious", 
                    religious_data: { 
                        title: "نتيجة الاستنباط", 
                        perspectives: [{name: "تحليل عام", ruling: "مباح", text: aiText, colorType: "حلال"}],
                        preferred: {opinion: "يرجى مراجعة النص المذكور", justification: "الرد لم يكن بصيغة JSON", evidence: "عام"}
                    } 
                });
            }
        } else {
            console.error("Gemini API Error details:", JSON.stringify(data));
            return res.status(500).json({ error: "لم يتم استلام رد صحيح من جوجل" });
        }
    } catch (error) {
        console.error("Critical Server Error:", error);
        return res.status(500).json({ error: "حدث خطأ داخلي في الخادم" });
    }
}
