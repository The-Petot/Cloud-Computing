FROM imbios/bun-node:18-slim as development

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install

COPY . .

RUN bun run build

FROM imbios/bun-node:18-slim as production

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install --production

COPY --from=development /app/dist . 

CMD [ "bun", "run", "start" ]