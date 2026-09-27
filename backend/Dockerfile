FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# prisma.config.ts resolves DATABASE_URL eagerly, even for `generate` (which never
# actually connects to a database, just reads the schema) — a placeholder is enough to
# get past that check at build time. The real value is injected at runtime via compose.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate

EXPOSE 4000

CMD ["node", "src/server.js"]
