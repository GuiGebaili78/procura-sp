# Next.js com API Routes integradas
FROM node:20-alpine AS base

WORKDIR /app

# Instalar dependências para PostgreSQL
RUN apk add --no-cache postgresql-client

# Copia package.json e instala dependências
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile; \
    else npm ci; \
    fi

# Copia o código fonte
COPY . .

EXPOSE 3000

# Comando padrão para desenvolvimento
CMD ["npm", "run", "dev:only"]
