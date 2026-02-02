/**
 * CellStation Scraper Server
 * שרת Puppeteer שמתחבר ל-CellStation ושולף את נתוני הסימים
 * מיועד להרצה על Render.com (Free tier)
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'CellStation Scraper API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /',
      scrape: 'POST /scrape-cellstation'
    }
  });
});

/**
 * Main scraping endpoint
 */
app.post('/scrape-cellstation', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('🚀 התחלת סנכרון CellStation');
  
  // Validation
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing credentials (username or password)' 
    });
  }
  
  let browser;
  try {
    console.log('📦 מפעיל דפדפן...');
    
    // Launch browser - will find Chrome automatically
    browser = await puppeteer.launch({
      headless: true,
      executablePath: puppeteer.executablePath(),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🔐 מתחבר ל-CellStation...');
    
    // Navigate to login page
    await page.goto('https://cellstation.co.il/portal/login.php', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for login form
    await page.waitForSelector('input[type="text"], input[type="tel"], input[name*="user"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    console.log('✍️ ממלא פרטי התחברות...');
    
    // Fill login form
    await page.type('input[type="text"], input[type="tel"], input[name*="user"]', username, { delay: 50 });
    await page.type('input[type="password"]', password, { delay: 50 });
    
    console.log('📤 שולח טופס התחברות...');
    
    // Submit form and wait for navigation
    await Promise.all([
      page.click('button[type="submit"], input[type="submit"]'),
      page.waitForNavigation({ 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      })
    ]);
    
    console.log('⏳ ממתין לטעינת הסימים...');
    
    // Wait for cards to appear
    await page.waitForSelector('.card', { timeout: 15000 });
    
    console.log('📊 מחלץ נתוני סימים...');
    
    // Extract SIM data
    const sims = await page.evaluate(() => {
      const cards = document.querySelectorAll('.card');
      const results = [];
      
      cards.forEach(card => {
        try {
          // Extract short number
          const shortNumberEl = card.querySelector('.pstyle');
          const shortNumber = shortNumberEl ? shortNumberEl.textContent.trim() : '';
          
          // Extract background color (status)
          const headerDiv = card.querySelector('.content-row[style*="background-color"]');
          const bgColor = headerDiv ? headerDiv.style.backgroundColor : '';
          const isActive = bgColor.includes('green');
          
          // Extract numbers (local, israeli, ICCID)
          const numbersDiv = card.querySelector('.content-row[style*="text-align: right"]');
          let localNumber = '', israeliNumber = '', simNumber = '';
          
          if (numbersDiv) {
            const numbersText = numbersDiv.innerHTML.split('<br>').map(n => n.trim());
            localNumber = numbersText[0] || '';
            israeliNumber = numbersText[1] || '';
            simNumber = numbersText[2] || '';
          }
          
          // Extract package name
          const planEl = card.querySelector('.plan');
          const packageName = planEl ? planEl.textContent.trim() : '';
          
          // Extract expiry date
          const expiryText = card.querySelector('p[sty
