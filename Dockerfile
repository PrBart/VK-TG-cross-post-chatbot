FROM node:12

WORKDIR /app

COPY . .

RUN apt-get update
RUN apt-get install -y --allow-unauthenticated imagemagick graphicsmagick webp ffmpeg
RUN npm install
RUN npm run build
CMD ["npm", "run", "start"]
