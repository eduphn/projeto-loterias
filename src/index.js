const { fetchLatest, fetchByConcurso } = require('./services/lotofacil');

async function main() {
  // Exemplo: busca o último concurso
  const latest = await fetchLatest();
  console.log(`Último concurso: ${latest.numero} — ${latest.dataApuracao}`);
  console.log(`Dezenas: ${latest.listaDezenas.join(', ')}`);

  // Exemplo: busca o concurso 1 (primeiro da história)
  const primeiro = await fetchByConcurso(1);
  console.log(`\nPrimeiro concurso: ${primeiro.numero} — ${primeiro.dataApuracao}`);
  console.log(`Dezenas: ${primeiro.listaDezenas.join(', ')}`);
}

main().catch(console.error);
