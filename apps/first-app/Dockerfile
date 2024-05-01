# Check out https://hub.docker.com/_/node to select a new base image
FROM node:18.15
ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port
# Set to a non-root built-in user `node`

USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/dist/${SERVICE}

WORKDIR /home/node/dist/${SERVICE}

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)



COPY --chown=node package*.json ./
COPY --chown=node yarn.lock ./

RUN yarn install

# Bundle app source code
COPY --chown=node . .

# надо придумать как применять миграции автоматически, а не самому каждый раз
# этот способ не работает потому что нужно в окружении иметь переменную DATABASE_URL
# а в открытом виде в этом докерфайле я не могу ее оставлять
# RUN yarn prisma migrate deploy
RUN yarn build:${SERVICE}

RUN yarn prisma generate

# Bind to all network interfaces so that it can be mapped to the host OS

EXPOSE ${PORT}

CMD yarn 'start:first-app'
