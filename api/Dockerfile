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
COPY package.json .   
...
CMD ["npm", "start"]
