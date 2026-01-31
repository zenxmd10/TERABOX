FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Koyeb default ആയി 8080 പോർട്ടാണ് ഉപയോഗിക്കുന്നത്
EXPOSE 8080

CMD ["node", "index.js"]

