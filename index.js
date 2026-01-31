const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

const app = express();
app.use(express.json());
puppeteer.use(StealthPlugin());

app.get('/', (req, res) => res.send('Terabox API is Live! Use /getlink?url=LINK'));

app.all('/getlink', async (req, res) => {
    const url = req.query.url || req.body.url;
    if (!url) return res.status(400).json({ error: "URL ആവശ്യമാണ്!" });

    let browser;
    try {
        browser = await puppeteer.launch({
            // Docker-ൽ ക്രോം ഇരിക്കുന്ന പാത്ത്
            executablePath: '/usr/bin/google-chrome-stable',
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.goto('https://tboxdownloader.in/', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 10000));

        const captchaToken = await page.evaluate(() => {
            return document.querySelector('[name="cf-turnstile-response"]')?.value;
        });

        const response = await axios.post('https://tbox-api-stable.subhodas5673.workers.dev/', {
            url: url,
            captchaToken: captchaToken
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(process.env.PORT || 10000);
