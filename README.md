# SAM Água - Loja Virtual de Água Mineral

Aplicação mobile-first de e-commerce para encomenda e entrega de água mineral em Maputo, Moçambique. Permite aos clientes encomendar água com entrega rápida, acompanhar pedidos em tempo real e pagar via M-Pesa, eMola, POS ou dinheiro.

## Funcionalidades

- **Catálogo de Produtos** — Água Namaacha, Fonte Fresca, Natura e mais
- **Carrinho e Checkout** — Com seleção de endereço e método de pagamento
- **Rastreamento em Tempo Real** — Acompanhe a entrega no mapa
- **Painel Admin** — Gestão de produtos, operadores, lojas e promoções
- **Painel Operador** — Gestão de entregas e stock
- **Multi-idioma** — Português e Inglês
- **Mobile** — Suporte a Android via Capacitor

## Tecnologias

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Framer Motion
- Lovable Cloud (autenticação, base de dados, edge functions)
- Capacitor (Android)
- Google Maps API

## Desenvolvimento Local

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

> É necessária ligação à internet para os serviços de backend e Google Maps.

## Build Android

```sh
npm run build
npx cap sync android
npx cap run android
```

## Licença

Projeto privado — SAM.co.mz
