const fs = require('fs');
const path = require('path');
const { fetchAll } = require('../services/lotofacil');

const OUTPUT_FILE = path.resolve(__dirname, '../../data/lotofacil-resultados.json');

async function main() {
  console.log('Iniciando download de todos os resultados da Lotofácil...');
  console.log('Isso pode levar alguns minutos.\n');

  const resultados = await fetchAll({
    batchSize: 30,
    onProgress: ({ fetched, total }) => {
      const pct = ((fetched / total) * 100).toFixed(1);
      process.stdout.write(`\rProgresso: ${fetched}/${total} concursos (${pct}%)`);
    },
  });

  console.log(`\n\nTotal de concursos baixados: ${resultados.length}`);

  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(resultados, null, 2), 'utf-8');
  console.log(`Resultados salvos em: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('\nErro ao baixar resultados:', err.message);
  process.exit(1);
});
