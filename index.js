const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

const app = express();
app.use(express.json());
puppeteer.use(StealthPlugin());

app.get('/', (req, res) => {
    res.send('Terabox API is Live! Usage: /getlink?url=YOUR_LINK');
});

app.all('/getlink', async (req, res) => {
    const url = req.query.url || req.body.url;
    
    if (!url) {
        return res.status(400).json({ error: "URL ആവശ്യമാണ്! ?url=ലിങ്ക് എന്ന് ചേർക്കുക." });
    }

    let browser;
    try {
        console.log(`Processing: ${url}`);
        browser = await puppeteer.launch({
            // Render ബിൽഡ് പാക്ക് ഇൻസ്റ്റാൾ ചെയ്യുന്ന പാത്ത്
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/google-chrome',
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto('https://tboxdownloader.in/', { waitUntil: 'networkidle2' });
        
        // ക്യാപ്‌ച ലോഡ് ആകാൻ കാക്കുന്നു
        await new Promise(resolve => setTimeout(resolve, 10000));

        const captchaToken = await page.evaluate(() => {
            return document.querySelector('[name="cf-turnstile-response"]')?.value;
        });

        if (!captchaToken) throw new Error("Captcha Token കണ്ടുപിടിക്കാൻ കഴിഞ്ഞില്ല!");

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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
