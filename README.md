# 99 Web

Conceito independente de interface web para os serviços da 99: Corrida, Food, Entrega e Pay. Sem vínculo com a 99 ou com a DiDi. Nenhum pedido, corrida, entrega ou pagamento é real, e nada aqui consome serviços da empresa.

A tese: hoje todo pedido depende do aplicativo. Quem está no computador (uma loja em horário de pico, um escritório na hora do almoço) tem o endereço na tela e mesmo assim precisa pegar o celular. Este protótipo mostra a interface que falta, com desktop como versão principal. A web muda o layout, nunca o produto: componentes, categorias, rótulos e ícones são os do aplicativo.

## Rodando

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Rotas

| Rota | O que é |
|---|---|
| `/` | Início com os três serviços |
| `/comida` | Food: Ofertas, Preferidos, Lojas recomendadas na região, filtros e carrinho em coluna fixa |
| `/comida/[slug]` | Loja com cardápio, detalhe de item em modal, grupos de opções e "Em alta" |
| `/comida/checkout` | Detalhes da entrega, No Horário, Pagar, Cupons de desconto, Resumo do pedido |
| `/corrida` | "Para onde vamos?", endereços recentes, Pop · Moto · Pop Expresso · Negocia · Táxi · Entrega Moto |
| `/entrega` | 99 Entrega: Enviar · Receber, par origem e destino, Informações da entrega, Entrega Moto · Entrega Carro |
| `/pedido/[id]` | Acompanhamento das três verticais, com avanço automático |

Links de demonstração que funcionam sem passar pelo fluxo: `/pedido/demo-comida`, `/pedido/demo-corrida`, `/pedido/demo-entrega`.

## O que vem do app

- Cabeçalho amarelo com avatar, saudação ou endereço e ações à direita. O conteúdo branco sobe por cima com raio de 24px.
- Pílula de navegação inferior flutuante: Corrida · Food · Entrega · Pay. Pay aparece desabilitado, fora do escopo.
- Botão primário amarelo com texto preto bold, raio de 12px, com preço numa linha e ação na outra ("R$ 13,74 / Solicitar Pop").
- Barra de ação inferior com meio de pagamento ou total à esquerda e o botão à direita.
- Campo de endereço único com sugestões, igual em corrida e entrega, com endereços recentes antes de digitar.
- Verde para preço promocional, economia, cupom e frete grátis. Laranja só como acento: aba ativa, pino de destino, ranking, "Em alta".
- Campos de formulário sem borda, com asterisco vermelho no obrigatório.
- Menu lateral aberto pelo avatar, com os itens e as cores do app.

## Como testar os estados

- **Carregamento**: esqueleto na listagem de lojas ao abrir `/comida` ou trocar de endereço.
- **Vazio**: carrinho sem item, busca sem resultado, `/pedido/qualquer-coisa`.
- **Erro**: endereço "Sítio" no seletor (fora do raio de entrega); lojas "Casa da Coxinha" e "Pizza na Pedra" (fechadas); item "Bacon jam" (indisponível); corrida com mais de 25 km (nenhum motorista na primeira tentativa); qualquer endereço fora do Brasil na corrida ou na entrega.
- **Bloqueio**: todo CTA desabilitado mostra abaixo o que falta.

## Mapa e endereços

Mapa real com [Leaflet](https://leafletjs.com) e tiles do OpenStreetMap, dessaturados por CSS para o amarelo e o verde se destacarem. Busca de endereço e endereço reverso pelo [Nominatim](https://nominatim.org), trajeto pelo [OSRM](http://project-osrm.org), ambos abertos e sem chave. A origem da corrida e a coleta da entrega começam na localização do navegador; se o acesso for negado, caem em Vila Madalena, São Paulo. A cobertura é o Brasil inteiro, por ser um teste. Os serviços públicos têm limite de uso e servem para demonstração, não para produção.

Colar um endereço completo no campo de endereço (vindo de um cardápio web, planilha ou WhatsApp) também funciona: o parser em `src/lib/parseAddress.ts` reconhece rua, número, complemento, bairro, cidade, UF, CEP, nome e telefone, resolve o ponto no mapa e preenche os contatos.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Motion, Leaflet. Sem backend, sem API da 99, sem localStorage: o estado vive em contexto React. Sem biblioteca de componentes; tudo em `src/components`.

## Estrutura

```
src/
  app/          rotas
  components/   ui, layout, map, comida, corrida, entrega, payment, pedido
  context/      AppProvider: endereço, carrinho e pedidos em memória
  data/         lojas, endereços recentes, categorias de corrida e entrega, menu lateral, pedidos demo
  lib/          tipos, geocodificação, parser de endereço, preços, estágios, formatação
```

Os dados de autoria do rodapé ficam em `src/data/author.ts`.

Tokens, tipografia, componentes e nomenclatura seguem `DESIGN.md` (v2); escopo e fluxos seguem `spec-99-web.md`.
