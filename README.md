# 99 Web

Conceito independente de interface web para os três serviços da 99: comida, corrida e entrega. Sem vínculo com a 99 ou com a DiDi. Nenhum pedido, corrida, entrega ou pagamento é real, e nada aqui consome serviços da empresa.

A tese: hoje todo pedido depende do aplicativo. Quem está no computador (um restaurante em horário de pico, um escritório na hora do almoço) precisa pegar o celular e redigitar o que já está na tela. Este protótipo mostra a interface que falta, com desktop como versão principal.

## Rodando

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Rotas

| Rota | O que é |
|---|---|
| `/` | Início com seletor das três verticais |
| `/comida` | Restaurantes, categorias, busca e sacola persistente |
| `/comida/[slug]` | Cardápio com modal de item, opções e adicionais |
| `/comida/checkout` | Endereço, entrega, pagamento e cupom |
| `/corrida` | Origem na localização atual, destino com busca real, categoria, pagamento e observação |
| `/entrega` | Coleta e entrega no estilo do app: endereço no mapa e detalhes de contato. Colar um endereço completo no campo preenche tudo |
| `/pedido/[id]` | Acompanhamento das três verticais, com avanço automático |

Links de demonstração que funcionam mesmo sem passar pelo fluxo: `/pedido/demo-comida`, `/pedido/demo-corrida`, `/pedido/demo-entrega`.

## Como testar os estados

- **Carregamento**: esqueleto na listagem de restaurantes ao abrir `/comida` ou trocar de endereço.
- **Vazio**: sacola sem item, busca sem resultado, `/pedido/qualquer-coisa`.
- **Erro**: endereço "Sítio" no seletor de endereço (fora da área); restaurantes "Casa da Coxinha" e "Pizza na Pedra" (fechados); item "Bacon jam" (indisponível); corrida com mais de 25 km (nenhum motorista na primeira tentativa); qualquer endereço fora do Brasil na corrida ou na entrega (a cobertura é o país inteiro, por ser um teste).
- **Bloqueio**: todo CTA desabilitado mostra abaixo o que falta.

## Mapa e endereços

Mapa real com [Leaflet](https://leafletjs.com) e tiles do OpenStreetMap. Busca de endereço e endereço reverso pelo [Nominatim](https://nominatim.org) e trajeto pelo [OSRM](http://project-osrm.org), ambos abertos e sem chave. A origem da corrida e a coleta da entrega começam na localização do navegador; se o acesso for negado, caem em Vila Madalena, São Paulo. Os serviços públicos têm limite de uso e servem para demonstração, não para produção.

## Colar dados

Ao colar um endereço completo no campo de endereço da entrega, o parser em `src/lib/parseAddress.ts` reconhece rua, número, complemento, bairro, cidade, UF, CEP, nome e telefone em texto livre. Formatos cobertos:

```
Rua Augusta, 1500, Consolação, São Paulo - SP, 01304-001
Av. Paulista 1578 - Bela Vista - São Paulo/SP CEP 01310-200
RUA DOS PINHEIROS, 248 - PINHEIROS - SAO PAULO - SP - 05422-001
Alameda Santos, 2300 ap 12, Cerqueira César - CEP 01419-002 - São Paulo SP
R. Frei Caneca, 569 - Consolação, São Paulo - SP, 01307-001 (Bloco B, apto 12) Contato: João 11 91234-5678

Cliente: Maria Souza
Tel: (11) 98765-4321
Endereço: R. Oscar Freire, 379 apto 42
Bairro: Jardins
Cidade: São Paulo
CEP: 01426-001
```

Depois do parse, o endereço é resolvido no mapa pelo Nominatim; complemento, nome e telefone vão para os campos de contato. Campo não reconhecido fica em branco, nunca preenchido errado. Texto sem endereço ("olá, quero um lanche") não preenche nada.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Motion, Leaflet. Sem backend, sem API da 99, sem localStorage: o estado vive em contexto React. Sem biblioteca de componentes; tudo em `src/components`.

## Estrutura

```
src/
  app/          rotas
  components/   ui, layout, map, comida, corrida, entrega, payment, pedido
  context/      AppProvider: endereço, sacola e pedidos em memória
  data/         restaurantes, endereços, categorias de corrida, pedidos demo
  lib/          tipos, parser de endereço, preços, estágios, formatação
```

Os dados de autoria do rodapé ficam em `src/data/author.ts`.

Tokens de cor, tipografia e espaçamento seguem `DESIGN.md`; escopo e fluxos seguem `spec-99-web.md`.
