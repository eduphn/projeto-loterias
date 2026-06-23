# Projeto Loterias

Consulta e armazenamento de resultados das Loterias CAIXA via API não oficial.

## Requisitos

- Node.js >= 18

## Instalação

```bash
npm install
```

## Painel Web

Após gerar os dados (ver comandos abaixo), sirva o projeto com:

```bash
npm run serve
```

O painel em `index.html` exibe as sequências repetidas de ambas as loterias e permite **diagnosticar um jogo**: selecione 15 números e verifique se pelo menos 14 deles saíram juntos em algum sorteio da Lotofácil.

## Comandos

### Atualizar histórico

Atualiza `data/lotofacil-resultados.json`: se o arquivo já existir, verifica quais concursos estão ausentes e baixa somente esses até o último disponível. Se o arquivo ainda não existir, baixa o histórico desde o concurso 1.

```bash
npm run fetch:all
```

> Execute periodicamente para incrementar o arquivo com os novos concursos sem baixar tudo de novo.

### Ver último resultado

```bash
npm run fetch:latest
```

### Sequências de números que se repetiram

Percorre o histórico completo e lista todas as combinações de N números (dentro de um mesmo jogo de 15) que apareceram em mais de um concurso. Salva em `data/sequencias-repetidas-<tamanho>.txt`:

```bash
# Exemplo com 7 números
npm run sequencias:repetidas -- 7

# Exemplo com 10 números
npm run sequencias:repetidas -- 10
```

O tamanho deve ser um número entre 1 e 15.

### Exportar sequências para JSON (painel web)

Converte os arquivos `.txt` gerados acima para JSON consumido pelo painel:

```bash
# Lotofácil (todos os tamanhos)
npm run export:json:lotofacil

# Mega-Sena (todos os tamanhos)
npm run export:json:megasena

# Ambas as loterias
npm run export:json
```

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
