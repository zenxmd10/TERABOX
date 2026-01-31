FROM ghcr.io/puppeteer/puppeteer:latest

USER root
WORKDIR /app

# സിസ്റ്റം അപ്ഡേറ്റ് ചെയ്ത് ആവശ്യമായ ലൈബ്രറികൾ ഇൻസ്റ്റാൾ ചെയ്യുന്നു
RUN apt-get update && apt-get install -y \
    google-chrome-stable \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# പോർട്ട് സെറ്റ് ചെയ്യുന്നു
ENV PORT=10000
EXPOSE 10000

CMD ["node", "index.js"]

