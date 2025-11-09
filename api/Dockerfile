# Estágio 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install

# Estágio 2: Produção
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY index.js .

# Expõe a porta que o index.js usa
EXPOSE 3000

# Comando para rodar a aplicação
CMD ["npm", "start"]
