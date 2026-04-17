# Projeto Loterias

Consulta e armazenamento de resultados das Loterias CAIXA via API não oficial.

## Requisitos

- Node.js >= 18

## Instalação

```bash
npm install
```

## Comandos

### Atualizar histórico completo

Baixa todos os concursos da Lotofácil e salva em `data/lotofacil-resultados.json`:

```bash
npm run fetch:all
```

> Execute periodicamente para manter o arquivo atualizado com os novos concursos.

### Ver último resultado

```bash
npm run fetch:latest
```

### Sequências de 7 números que se repetiram

Percorre o histórico completo e lista todas as combinações de N números (dentro de um mesmo jogo de 15) que apareceram em mais de um concurso. Salva o resultado em `data/sequencias-repetidas-<tamanho>.txt`:

```bash
# Exemplo com 7 números
npm run sequencias:repetidas -- 7

# Exemplo com 10 números
npm run sequencias:repetidas -- 10
```

O tamanho deve ser um número entre 1 e 15.

## Mega-Sena

### Atualizar histórico completo (Mega-Sena)

```bash
npm run megasena:fetch:all
```

### Ver último resultado (Mega-Sena)

```bash
npm run megasena:fetch:latest
```

### Sequências de números que se repetiram (Mega-Sena)

Salva o resultado em `data/megasena-sequencias-repetidas-<tamanho>.txt`:

```bash
# Exemplo com 3 números
npm run megasena:sequencias:repetidas -- 3
```

O tamanho deve ser um número entre 1 e 6.

## Fonte dos dados

API do portal Loterias CAIXA:

- Último concurso: `GET https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil`
- Por número: `GET https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/{numero}`
- Último concurso (Mega-Sena): `GET https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena`
- Por número (Mega-Sena): `GET https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/{numero}`
