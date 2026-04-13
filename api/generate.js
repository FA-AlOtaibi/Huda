export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

    try {
        const { prompt } = req.body; // نأخذ فقط السؤال من المستخدم
        const apiKey = process.env.GROQ_API_KEY;

        // وضعنا التعليمات هنا (الباك إند) لضمان أعلى مستوى من الدقة وعدم الهلوسة
        const systemInstruction = `أنت عالم محقق شرعي خبير ومدقق لغوي. 
قواعدك الصارمة التي لا تنحرف عنها أبداً:
1. الأمانة العلمية المطلقة: يُحظر عليك حظراً باتاً اختراع أحاديث، أو تأليف أرقام أحاديث، أو عزو آيات في غير موضعها.
2. التوثيق النصي: عند ذكر دليل، يجب أن يكون نصياً من (البخاري، مسلم، الكتب الستة، أو أمهات الكتب الفقهية كالمغني والمجموع). إذا لم تجد نصاً مباشراً، اكتب صراحة: "لم أقف على نص شرعي مباشر في هذه المسألة" ولا تجتهد بوضع أدلة بعيدة.
3. التنوع الفقهي: اذكر 3-5 آراء للمذاهب المعتبرة مع توضيح وجه الاستدلال لكل منهم.
4. الرد بصيغة JSON حصراً بهذا الهيكل:
{
  "type": "religious" | "literary",
  "religious_data": {
    "title": "عنوان المسألة",
    "perspectives": [{"name": "المذهب", "ruling": "الحكم", "text": "التفصيل بالأدلة"}],
    "preferred": {"opinion": "القول الراجح", "justification": "التعليل العلمي", "evidence": "الدليل النصي الصريح"}
  },
  "literary_data": { "author": "القائل", "source": "المصدر", "explanation": "الشرح", "suggestion_text": "الاستنباط" }
}`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemInstruction },
                    { role: "user", content: prompt }
                ],
                temperature: 0, // منع الإبداع والتأليف تماماً
                top_p: 0.1,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0].message) {
            return res.status(200).json(JSON.parse(data.choices[0].message.content));
        } else {
            throw new Error("Invalid response from AI");
        }

    } catch (error) {
        console.error("Critical Error:", error);
        res.status(500).json({ error: "حدث خطأ في معالجة الاستنباط" });
    }
}
