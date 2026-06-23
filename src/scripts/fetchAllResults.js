const fs = require('fs');
const path = require('path');
const { fetchUpdates } = require('../services/lotofacil');

const OUTPUT_FILE = path.resolve(__dirname, '../../data/lotofacil-resultados.json');

function readExistingResults() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    return [];
  }

  const fileContent = fs.readFileSync(OUTPUT_FILE, 'utf-8');
  if (!fileContent.trim()) {
    return [];
  }

  const data = JSON.parse(fileContent);
  if (!Array.isArray(data)) {
    throw new Error(`Arquivo inválido: ${OUTPUT_FILE} não contém uma lista de resultados.`);
  }

  return data;
}

async function main() {
  console.log('Atualizando resultados da Lotofácil...');

  const existentes = readExistingResults();
  console.log(`Concursos já salvos: ${existentes.length}`);

  const atualizacao = await fetchUpdates(existentes, {
    batchSize: 30,
    onProgress: ({ fetched, checked, total }) => {
      const pct = ((checked / total) * 100).toFixed(1);
      process.stdout.write(`\rBaixando concursos ausentes: ${checked}/${total} verificados, ${fetched} encontrados (${pct}%)`);
    },
  });

  console.log(`\nÚltimo concurso salvo localmente: ${atualizacao.lastLocal || 'nenhum'}`);
  console.log(`Último concurso disponível na API: ${atualizacao.latest.numero}`);
  console.log(`Concursos ausentes antes da atualização: ${atualizacao.missingNumbers.length}`);

  if (atualizacao.added.length === 0) {
    console.log('Nenhum concurso novo para baixar.');
  } else {
    console.log(`Concursos baixados e adicionados: ${atualizacao.added.length}`);
  }

  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(atualizacao.results, null, 2), 'utf-8');
  console.log(`Total de concursos no arquivo: ${atualizacao.results.length}`);
  console.log(`Resultados salvos em: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('\nErro ao baixar resultados:', err.message);
  process.exit(1);
});
