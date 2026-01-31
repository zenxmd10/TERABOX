FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

# ലെയറുകൾ കുറച്ച് വേഗത്തിൽ ബിൽഡ് ചെയ്യാൻ
COPY package*.json ./
RUN npm install

COPY . .

# പോർട്ട് സെറ്റ് ചെയ്യുന്നു
ENV PORT=10000
EXPOSE 10000

CMD ["node", "index.js"]
