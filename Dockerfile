# build frontend
FROM node:19 AS build-stage

ADD . /app/
WORKDIR /app

RUN npm install --global pnpm
RUN pnpm install
RUN npm run build

# build docker image
FROM --platform=linux/amd64 nginx:1.21

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY --from=build-stage /app/nginx/nginx.conf /etc/nginx/nginx.conf
