export default async function handler(req, res) {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });

    // الاتصال المباشر بـ API الدرر السنية الرسمي
    const url = `https://dorar.net/dorar_api.json?skey=${encodeURIComponent(q)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "فشل جلب الأحاديث" });
    }
}
