const axios = require('axios');

const BASE_URL = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil';

/**
 * Busca o resultado do último concurso da Lotofácil.
 * @returns {Promise<Object>} Dados do concurso
 */
async function fetchLatest() {
  const { data } = await axios.get(BASE_URL);
  return data;
}

/**
 * Busca o resultado de um concurso específico da Lotofácil.
 * @param {number} numero - Número do concurso
 * @returns {Promise<Object>} Dados do concurso
 */
async function fetchByConcurso(numero) {
  const { data } = await axios.get(`${BASE_URL}/${numero}`);
  return data;
}

/**
 * Busca todos os resultados desde o concurso 1 até o mais recente.
 * Faz as requisições em lotes para não sobrecarregar a API.
 * @param {Object} options
 * @param {number} [options.batchSize=50] - Tamanho do lote de requisições paralelas
 * @param {Function} [options.onProgress] - Callback chamado após cada lote
 * @returns {Promise<Object[]>} Lista de resultados ordenados por número do concurso
 */
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
