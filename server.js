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
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
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
          const expiryText = card.querySelector('p[style*="display: inline-block"]');
          let expiryDate = null;
          if (expiryText) {
            const match = expiryText.textContent.match(/\d{4}-\d{2}-\d{2}/);
            expiryDate = match ? match[0] : null;
          }
          
          // Only add if we have a valid SIM number
          if (simNumber && simNumber.length > 10) {
            results.push({
              short_number: shortNumber,
              local_number: localNumber,
              israeli_number: israeliNumber,
              sim_number: simNumber,
              package_name: packageName,
              expiry_date: expiryDate,
              is_active: isActive,
              is_rented: false
            });
          }
        } catch (err) {
          console.error('Error parsing card:', err);
        }
      });
      
      return results;
    });
    
    await browser.close();
    
    console.log(`✅ הושלם! נמצאו ${sims.length} סימים`);
    
    res.json({ 
      success: true, 
      sims: sims,
      count: sims.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
    
    if (browser) {
      await browser.close();
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Ready to scrape CellStation`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
  console.log(`🔗 Scrape endpoint: POST http://localhost:${PORT}/scrape-cellstation`);
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});
