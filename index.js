const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

const app = express();
app.use(express.json()); // JSON ബോഡി സപ്പോർട്ട് ചെയ്യാൻ
puppeteer.use(StealthPlugin());

// ഹോം പേജ് - ആപ്പ് വർക്ക് ആകുന്നുണ്ടോ എന്ന് നോക്കാൻ
app.get('/', (req, res) => {
    res.send('Terabox Bypass API is Live! Use /getlink?url=YOUR_LINK to get the link.');
});

// GET ആയും POST ആയും ഈ റൂട്ട് ഉപയോഗിക്കാം
app.all('/getlink', async (req, res) => {
    // URL വഴി ആണെങ്കിൽ req.query, ബോഡി വഴി ആണെങ്കിൽ req.body
    const url = req.query.url || req.body.url;
    
    if (!url) {
        return res.status(400).json({ 
            error: "ലിങ്ക് നൽകിയിട്ടില്ല!", 
            usage: "https://terabox-hivi.onrender.com/getlink?url=https://teraboxapp.com/s/xxxx" 
        });
    }

    let browser;
    try {
        console.log(`Processing URL: ${url}`);
        
        browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome', // Render-ലെ ബ്രൗസർ പാത്ത്
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage', 
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        
        // ടോക്കൺ എടുക്കാനുള്ള സൈറ്റിലേക്ക് പോകുന്നു
        await page.goto('https://tboxdownloader.in/', { 
            waitUntil: 'networkidle2', 
            timeout: 60000 
        });

        // ക്യാപ്‌ച ലോഡ് ആകാനും സോൾവ് ആകാനും സമയം നൽകുന്നു
        await new Promise(resolve => setTimeout(resolve, 10000));

        const captchaToken = await page.evaluate(() => {
            return document.querySelector('[name="cf-turnstile-response"]')?.value || 
                   document.querySelector('#cf-turnstile-response')?.value;
        });

        if (!captchaToken) {
            throw new Error("Captcha Token കണ്ടുപിടിക്കാൻ കഴിഞ്ഞില്ല! ഒന്നുകൂടി ശ്രമിക്കൂ.");
        }

        // മെയിൻ API-ലേക്ക് ഡാറ്റ അയക്കുന്നു
        const response = await axios.post('https://tbox-api-stable.subhodas5673.workers.dev/', {
            url: url,
            captchaToken: captchaToken
        });

        res.json(response.data);

    } catch (error) {
        console.error("Error occurred:", error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

// Render-ന്റെ പോർട്ട് 10000 ആണ്, അല്ലെങ്കിൽ എൻവയോൺമെന്റ് പോർട്ട് എടുക്കും
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
