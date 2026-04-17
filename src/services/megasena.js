const axios = require('axios');

const BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena';

async function fetchLatest() {
  const { data } = await axios.get(BASE_URL);
  return data;
}

async function fetchByConcurso(numero) {
  const { data } = await axios.get(`${BASE_URL}/${numero}`);
  return data;
}

async function fetchAll({ batchSize = 50, onProgress } = {}) {
  const latest = await fetchLatest();
  const total = latest.numero;

  const results = [];
  const numbers = Array.from({ length: total }, (_, i) => i + 1);

  for (let i = 0; i < numbers.length; i += batchSize) {
    const batch = numbers.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((n) => fetchByConcurso(n).catch(() => null))
    );
    results.push(...batchResults.filter(Boolean));

    if (typeof onProgress === 'function') {
      onProgress({ fetched: results.length, total });
    }
  }

  return results.sort((a, b) => a.numero - b.numero);
}

module.exports = { fetchLatest, fetchByConcurso, fetchAll };
