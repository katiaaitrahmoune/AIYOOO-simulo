const { Client } = require('pg');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { message } = JSON.parse(event.body);

    // Connect to your Neon database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    await client.connect();

    // Pull real numbers from your tables
    // Adjust these queries to match what you actually want the bot to know
    const customers = await client.query('SELECT COUNT(*) FROM customers');
    const enterprises = await client.query('SELECT COUNT(*) FROM enterprises');
    const receipts = await client.query('SELECT COUNT(*) FROM goods_receipts');

    await client.end();

    const dataContext = `
Données réelles actuelles de l'entreprise :
- Nombre de clients : ${customers.rows[0].count}
- Nombre d'entreprises suivies : ${enterprises.rows[0].count}
- Nombre de réceptions de marchandises enregistrées : ${receipts.rows[0].count}
`;

    // Ask Gemini to answer using that real data
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: `Tu es l'assistant "Ask the Twin" de Simulo. Réponds aux questions en te basant UNIQUEMENT sur ces données réelles :\n${dataContext}\nSi tu n'as pas l'information demandée dans ces données, dis-le honnêtement plutôt que d'inventer. Mets les chiffres importants entre <span class="stat">...</span>.`
      }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: response.text })
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong' })
    };
  }
};
