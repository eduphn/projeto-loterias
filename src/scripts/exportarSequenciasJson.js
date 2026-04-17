/**
 * Gera arquivos JSON de sequências repetidas para cada loteria.
 *
 * Uso:
 *   node src/scripts/exportarSequenciasJson.js               # todas as loterias e tamanhos
 *   node src/scripts/exportarSequenciasJson.js lotofacil     # só Lotofácil, todos os tamanhos
 *   node src/scripts/exportarSequenciasJson.js megasena 5    # só Mega-Sena, tamanho 5
 *
 * Saída:
 *   data/lotofacil/sequencia7.json
 *   data/megasena/sequencia5.json
 *   ... etc.
 */

const fs = require('fs');
const path = require('path');

const LOTERIAS = {
  lotofacil: {
    nome: 'Lotofácil',
    dataFile: path.resolve(__dirname, '../../data/lotofacil-resultados.json'),
    outputDir: path.resolve(__dirname, '../../data/lotofacil'),
    tamanhos: [7, 8, 10, 14, 15],
  },
  megasena: {
    nome: 'Mega-Sena',
    dataFile: path.resolve(__dirname, '../../data/megasena-resultados.json'),
    outputDir: path.resolve(__dirname, '../../data/megasena'),
    tamanhos: [5, 6],
  },
};

function* combinacoes(arr, k) {
  if (k === 0) { yield []; return; }
  for (let i = 0; i <= arr.length - k; i++) {
    for (const resto of combinacoes(arr.slice(i + 1), k - 1)) {
      yield [arr[i], ...resto];
    }
  }
}

function processarLoteria(loteriaKey, tamanho) {
  const cfg = LOTERIAS[loteriaKey];
  console.log(`\n[${cfg.nome}] Gerando sequências de ${tamanho} números...`);

  const raw = fs.readFileSync(cfg.dataFile, 'utf-8');
  const concursos = JSON.parse(raw);

  const mapa = new Map();
  let processados = 0;

  for (const c of concursos) {
    const dezenas = c.listaDezenas.map(Number).sort((a, b) => a - b);
    for (const combo of combinacoes(dezenas, tamanho)) {
      const chave = combo.map((n) => String(n).padStart(2, '0')).join('-');
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push(c.numero);
    }
    processados++;
    if (processados % 500 === 0) {
      process.stdout.write(`\r  Processando concurso ${processados}/${concursos.length}...`);
    }
  }
  process.stdout.write('\n');

  const repetidas = [];
  for (const [numeros, concursosArr] of mapa) {
    if (concursosArr.length > 1) {
      repetidas.push({ numeros, repeticoes: concursosArr.length, concursos: concursosArr });
    }
  }
  repetidas.sort((a, b) => b.repeticoes - a.repeticoes);

  fs.mkdirSync(cfg.outputDir, { recursive: true });

  const outputFile = path.join(cfg.outputDir, `sequencia${tamanho}.json`);
  const resultado = {
    loteria: cfg.nome,
    tamanho,
    total: repetidas.length,
    geradoEm: new Date().toLocaleString('pt-BR'),
    combinacoes: repetidas,
  };

  fs.writeFileSync(outputFile, JSON.stringify(resultado), 'utf-8');
  console.log(`  ✓ Salvo: ${outputFile} — ${repetidas.length} combinações`);
}

// --- Argument parsing ---
const [loteriaArg, tamanhoArg] = process.argv.slice(2);

if (loteriaArg && !LOTERIAS[loteriaArg]) {
  console.error(`Loteria inválida: "${loteriaArg}". Use: lotofacil | megasena`);
  process.exit(1);
}

const loteriasParaProcessar = loteriaArg ? [loteriaArg] : Object.keys(LOTERIAS);

for (const l of loteriasParaProcessar) {
  const tamanhos = tamanhoArg
    ? [parseInt(tamanhoArg, 10)]
    : LOTERIAS[l].tamanhos;

  for (const t of tamanhos) {
    processarLoteria(l, t);
  }
}

console.log('\nExportação concluída.');
