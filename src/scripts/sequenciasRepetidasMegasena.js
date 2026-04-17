const fs = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../../data/megasena-resultados.json');

const tamanho = parseInt(process.argv[2], 10);
if (!tamanho || tamanho < 1 || tamanho > 6) {
  console.error('Uso: node sequenciasRepetidasMegasena.js <tamanho>');
  console.error('Exemplo: node sequenciasRepetidasMegasena.js 3');
  console.error('Tamanho deve ser um número entre 1 e 6.');
  process.exit(1);
}

const OUTPUT_FILE = path.resolve(__dirname, `../../data/megasena-sequencias-repetidas-${tamanho}.txt`);

function* combinacoes(arr, k) {
  if (k === 0) { yield []; return; }
  for (let i = 0; i <= arr.length - k; i++) {
    for (const resto of combinacoes(arr.slice(i + 1), k - 1)) {
      yield [arr[i], ...resto];
    }
  }
}

function main() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const concursos = JSON.parse(raw);

  const mapa = new Map();

  console.log(`Processando ${concursos.length} concursos (combinações de ${tamanho} números)...`);

  for (const c of concursos) {
    const dezenas = c.listaDezenas.map(Number).sort((a, b) => a - b);

    for (const combo of combinacoes(dezenas, tamanho)) {
      const chave = combo.map((n) => String(n).padStart(2, '0')).join('-');
      if (!mapa.has(chave)) mapa.set(chave, []);
      mapa.get(chave).push(c.numero);
    }
  }

  const repetidas = [];
  for (const [combo, concursosOndeApareceu] of mapa) {
    if (concursosOndeApareceu.length > 1) {
      repetidas.push({ combo, concursos: concursosOndeApareceu });
    }
  }

  repetidas.sort((a, b) => b.concursos.length - a.concursos.length);

  console.log(`\nCombinações de ${tamanho} números que se repetiram: ${repetidas.length}\n`);

  const header = `${'Combinação'.padEnd(25)} ${'Repetições'.padStart(10)}  Concursos`;
  const separator = '-'.repeat(90);
  const linhas = [
    `Combinações de ${tamanho} números que se repetiram em concursos da Mega-Sena`,
    `Total: ${repetidas.length} combinações`,
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    '',
    header,
    separator,
  ];

  console.log(header);
  console.log(separator);

  for (const { combo, concursos } of repetidas) {
    const concursosStr =
      concursos.length <= 8
        ? concursos.join(', ')
        : concursos.slice(0, 8).join(', ') + ` ... (+${concursos.length - 8} mais)`;
    const linha = `${combo.padEnd(25)} ${String(concursos.length).padStart(10)}  ${concursosStr}`;
    console.log(linha);
    linhas.push(linha);
  }

  fs.writeFileSync(OUTPUT_FILE, linhas.join('\n'), 'utf-8');
  console.log(`\nResultado salvo em: ${OUTPUT_FILE}`);
}

main();
