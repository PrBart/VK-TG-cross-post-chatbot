FROM node:12

WORKDIR /app

COPY . .

RUN apt-get update
RUN apt-get install -y --allow-unauthenticated graphicsmagick ffmpeg
RUN npm install
RUN npm run build
EXPOSE 8080
