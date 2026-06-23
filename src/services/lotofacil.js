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

  return fetchRange(1, total, {
    batchSize,
    onProgress: ({ fetched, checked }) => {
      if (typeof onProgress === 'function') {
        onProgress({ fetched, checked, total });
      }
    },
  });
}

/**
 * Busca os resultados de um intervalo de concursos.
 * Faz as requisições em lotes para não sobrecarregar a API.
 * @param {number} start - Primeiro concurso do intervalo
 * @param {number} end - Último concurso do intervalo
 * @param {Object} options
 * @param {number} [options.batchSize=50] - Tamanho do lote de requisições paralelas
 * @param {Function} [options.onProgress] - Callback chamado após cada lote
 * @returns {Promise<Object[]>} Lista de resultados ordenados por número do concurso
 */
async function fetchRange(start, end, { batchSize = 50, onProgress } = {}) {
  if (start > end) {
    return [];
  }

  const numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return fetchMany(numbers, {
    batchSize,
    onProgress: (progress) => {
      if (typeof onProgress === 'function') {
        onProgress({ ...progress, start, end });
      }
    },
  });
}

/**
 * Busca os resultados de uma lista específica de concursos.
 * Faz as requisições em lotes para não sobrecarregar a API.
 * @param {number[]} numbers - Números dos concursos a buscar
 * @param {Object} options
 * @param {number} [options.batchSize=50] - Tamanho do lote de requisições paralelas
 * @param {Function} [options.onProgress] - Callback chamado após cada lote
 * @returns {Promise<Object[]>} Lista de resultados ordenados por número do concurso
 */
async function fetchMany(numbers, { batchSize = 50, onProgress } = {}) {
  const results = [];
  const total = numbers.length;

  for (let i = 0; i < numbers.length; i += batchSize) {
    const batch = numbers.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((n) => fetchByConcurso(n).catch(() => null))
    );
    results.push(...batchResults.filter(Boolean));

    if (typeof onProgress === 'function') {
      onProgress({ fetched: results.length, checked: Math.min(i + batch.length, total), total });
    }
  }

  return results.sort((a, b) => a.numero - b.numero);
}

/**
 * Busca apenas concursos ausentes no histórico local.
 * @param {Object[]} existingResults - Resultados já salvos
 * @param {Object} options
 * @param {number} [options.batchSize=50] - Tamanho do lote de requisições paralelas
 * @param {Function} [options.onProgress] - Callback chamado após cada lote
 * @returns {Promise<{latest:Object, lastLocal:number, missingNumbers:number[], added:Object[], results:Object[]}>}
 */
async function fetchUpdates(existingResults = [], { batchSize = 50, onProgress } = {}) {
  const latest = await fetchLatest();
  const existingNumbers = new Set();
  const lastLocal = existingResults.reduce((max, result) => {
    const numero = Number(result && result.numero);
    if (Number.isFinite(numero)) {
      existingNumbers.add(numero);
    }
    return Number.isFinite(numero) && numero > max ? numero : max;
  }, 0);

  const missingNumbers = [];
  for (let numero = 1; numero <= latest.numero; numero += 1) {
    if (!existingNumbers.has(numero)) {
      missingNumbers.push(numero);
    }
  }

  const added = await fetchMany(missingNumbers, {
    batchSize,
    onProgress,
  });

  const byNumero = new Map();
  for (const result of existingResults) {
    if (result && Number.isFinite(Number(result.numero))) {
      byNumero.set(Number(result.numero), result);
    }
  }
  for (const result of added) {
    byNumero.set(Number(result.numero), result);
  }

  const results = Array.from(byNumero.values()).sort((a, b) => a.numero - b.numero);

  return { latest, lastLocal, missingNumbers, added, results };
}

module.exports = { fetchLatest, fetchByConcurso, fetchAll, fetchRange, fetchMany, fetchUpdates };
