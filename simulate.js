const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // --- 1. Efficiency Score ---
    // TODO: replace with your real formula. For now, this is a placeholder
    // based on how many goods receipts exist relative to enterprises tracked
    // (just so the number moves with real data instead of being fake).
    const enterprisesResult = await client.query('SELECT COUNT(*) FROM enterprises');
    const receiptsResult = await client.query('SELECT COUNT(*) FROM goods_receipts');

    const enterpriseCount = parseInt(enterprisesResult.rows[0].count, 10) || 1;
    const receiptCount = parseInt(receiptsResult.rows[0].count, 10) || 0;

    // Simple placeholder formula - adjust once you know what "efficiency" should mean for you
    const efficiencyScore = Math.min(
      99,
      Math.round((receiptCount / enterpriseCount) * 10 + 50)
    );

    // --- 2. Cost Variance ---
    // TODO: replace with a real calculation once you have cost/budget columns
    // to compare (e.g. actual_cost vs expected_cost in goods_receipt_lines).
    const costVariance = -2.6; // placeholder until real cost columns are wired in

    // --- 3. Scenarios Modeled ---
    // TODO: if you have a dedicated "scenarios" table, count that instead.
    // For now this reuses the receipts count as a stand-in.
    const scenariosModeled = receiptCount;

    // --- 4. Throughput index (live chart points) ---
    // TODO: replace with a real time-series query, e.g. grouping goods_receipts
    // by hour/day. For now this generates a plausible-looking live curve.
    const points = [];
    let value = 40 + Math.random() * 20;
    for (let i = 0; i < 7; i++) {
      value += (Math.random() - 0.4) * 15;
      value = Math.max(15, Math.min(160, value));
      points.push([10 + i * 80, Math.round(value)]);
    }

    await client.end();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        efficiencyScore,
        costVariance,
        scenariosModeled,
        points
      })
    };

  } catch (error) {
    console.error(error);
    try { await client.end(); } catch (e) {}
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong' })
    };
  }
};
