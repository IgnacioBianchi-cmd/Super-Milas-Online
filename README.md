# Super Milas — Backend (Node.js + Express + MongoDB)

Backend del menú online y gestión de pedidos por sucursal para Super Milas.  
Frontend (React) y base de datos (infra) serán desarrollados por el equipo.

## Stack
- Node.js (LTS), Express
- MongoDB / Mongoose
- JWT auth, verificación por email (código 6 dígitos)
- Socket.io (eventos `pedido:nuevo`, `print:pedido`)
- Reportes con export CSV

## Requisitos
- Node 18/20/22 (ver `.nvmrc`)
- MongoDB local o Docker
- npm

## Setup rápido
```bash
cp .env.example .env
npm install
npm run dev