const { fetchLatest } = require('../services/megasena');

async function main() {
  console.log('Buscando último resultado da Mega-Sena...\n');
  const resultado = await fetchLatest();

  console.log(`Concurso:     ${resultado.numero}`);
  console.log(`Data:         ${resultado.dataApuracao}`);
  console.log(`Dezenas:      ${resultado.listaDezenas.join(' - ')}`);
  console.log(`Local:        ${resultado.localSorteio} - ${resultado.nomeMunicipioUFSorteio}`);
  console.log(`Acumulado:    ${resultado.acumulado ? 'Sim' : 'Não'}`);
  console.log('\nPremiação:');
  for (const faixa of resultado.listaRateioPremio) {
    console.log(
      `  ${faixa.descricaoFaixa}: ${faixa.numeroDeGanhadores} ganhador(es) - R$ ${faixa.valorPremio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    );
  }
  console.log(`\nPróximo concurso: ${resultado.numeroConcursoProximo} em ${resultado.dataProximoConcurso}`);
  console.log(`Estimativa do próximo prêmio: R$ ${resultado.valorEstimadoProximoConcurso.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
}

main().catch((err) => {
  console.error('Erro ao buscar resultado:', err.message);
  process.exit(1);
});
