FROM node:16.14.2 as build-step

ARG ENV
ENV ENV $ENV

RUN mkdir -p /app
WORKDIR /app
COPY package*.* /app
RUN npm install
COPY . /app
RUN node_modules/.bin/ng build --configuration=${ENV}

FROM nginx:1.22.1
COPY --from=build-step /app/dist/bta /usr/share/nginx/html
EXPOSE 4200:80