FROM imbios/bun-node:latest

COPY package.json . 
COPY bun.lockb . 

RUN bun install --production

COPY . .

CMD [ "bun", "run", "src/index.ts" ]