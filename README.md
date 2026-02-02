# 🚀 CellStation Scraper - שרת Puppeteer ל-Render.com

שרת Node.js + Puppeteer שמתחבר ל-CellStation ושולף את נתוני הסימים.
מיועד להרצה חינמית על Render.com.

---

## 📦 מה יש כאן?

- `server.js` - שרת Express עם Puppeteer
- `package.json` - תלויות (Express, Puppeteer, CORS)
- `.gitignore` - קבצים שלא נכנסים ל-Git

---

## 🎯 הוראות העלאה ל-Render.com (5 דקות)

### שלב 1: יצירת Repository ב-GitHub

1. **צור repository חדש ב-GitHub:**
   - שם: `cellstation-scraper` (או כל שם שתרצה)
   - Public או Private - לא משנה
   - **אל** תוסיף README, .gitignore (כבר יש לנו)

2. **העלה את הקבצים:**

```bash
# בטרמינל, בתיקייה שבה הקבצים נמצאים:
git init
git add .
git commit -m "Initial commit - CellStation scraper"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cellstation-scraper.git
git push -u origin main
```

או **פשוט העלה ידנית:**
- לך ל-GitHub → New Repository
- לאחר היצירה, לחץ "uploading an existing file"
- גרור את 3 הקבצים (server.js, package.json, .gitignore)
- Commit!

---

### שלב 2: יצירת Web Service ב-Render.com

1. **הרשם/התחבר ל-Render.com** (חינמי):
   https://render.com

2. **לחץ "New +" → "Web Service"**

3. **חבר את GitHub:**
   - אשר את החיבור ל-GitHub
   - בחר את ה-repository `cellstation-scraper`

4. **הגדרות השרת:**
   
   | שדה | ערך |
   |-----|-----|
   | **Name** | cellstation-scraper (או כל שם) |
   | **Region** | Frankfurt (הכי קרוב) |
   | **Branch** | main |
   | **Root Directory** | (השאר ריק) |
   | **Runtime** | Node |
   | **Build Command** | npm install |
   | **Start Command** | npm start |
   | **Instance Type** | **Free** ⭐ |

5. **Environment Variables:**
   
   אין צורך - הכל בקוד!

6. **לחץ "Create Web Service"**

7. **המתן 2-5 דקות** שהשרת יעלה

8. **העתק את ה-URL!**
   
   תראה משהו כמו:
   ```
   https://cellstation-scraper-xxxxx.onrender.com
   ```
   
   **זה ה-URL שצריך!** 📋

---

## 🧪 בדיקת השרת

אחרי שהשרת עלה, בדוק שהוא עובד:

### בדיקה 1: Health Check

פתח בדפדפן:
```
https://YOUR-APP.onrender.com/
```

אמור לראות:
```json
{
  "status": "ok",
  "message": "CellStation Scraper API",
  "version": "1.0.0"
}
```

### בדיקה 2: Scraping Test (אופציונלי)

אם אתה רוצה לבדוק שהוא עובד לפני שמחבר ל-Lovable:

```bash
curl -X POST https://YOUR-APP.onrender.com/scrape-cellstation \
  -H "Content-Type: application/json" \
  -d '{"username":"D0548499222","password":"M&deal20151218"}'
```

אמור לקבל:
```json
{
  "success": true,
  "sims": [...],
  "count": 25
}
```

---

## 🔗 חיבור ל-Lovable

עכשיו שיש לך את ה-URL, חזור ל-Lovable:

1. **לך ל-Settings → Secrets**

2. **מצא את `SCRAPER_URL`** (Lovable כבר יצר אותו עם https://example.com)

3. **ערוך אותו** ושים את ה-URL האמיתי:
   ```
   https://cellstation-scraper-xxxxx.onrender.com
   ```

4. **שמור!**

5. **לך לדף הסימים ולחץ "סנכרן סימים"**

6. **זהו! אמור לעבוד!** 🎉

---

## ⚠️ הערות חשובות על Render Free Tier

### Sleep Mode (מצב שינה)
- השרת "נרדם" אחרי **15 דקות** ללא פעילות
- הקריאה הראשונה אחרי שינה תיקח **30-60 שניות** (cold start)
- זה **נורמלי**! פשוט תחכה רגע

### פתרון אם זה מפריע:
אם אתה רוצה שהשרת יהיה תמיד "ער", תוכל:
- לשדרג ל-Render Paid ($7/חודש)
- או להוסיף Cron Job שיעיר אותו כל 10 דקות

אבל לרוב - זה לא צריך! סנכרון פעם ביום זה מספיק.

---

## 🐛 פתרון בעיות

### השרת לא עולה
- בדוק את ה-Logs ב-Render Dashboard
- וודא שה-Build Command: `npm install`
- וודא שה-Start Command: `npm start`

### השרת עולה אבל לא עובד
- בדוק את ה-Runtime Logs ב-Render
- חפש שגיאות באדום
- אם יש שגיאה - העתק אותה ותשאל

### "Request Timeout" בסנכרון
- זה בגלל Cold Start (השרת היה ישן)
- נסה שוב אחרי דקה
- בפעם השנייה יהיה מהיר!

### הסנכרון מחזיר 0 סימים
- בדוק שה-URL נכון ב-SCRAPER_URL
- בדוק שהפרטי התחברות נכונים בקוד
- בדוק את הלוגים של Render

---

## 💰 עלויות

**חינמי לחלוטין!** 🎉

Render Free tier כולל:
- 750 שעות חינם לחודש
- זה מספיק ל-31 ימים 24/7!
- אין מגבלת בקשות

---

## 🎊 סיימת!

עכשיו יש לך:
- ✅ שרת Puppeteer על Render (חינמי)
- ✅ Edge Function שקוראת אליו
- ✅ סנכרון סימים אוטומטי שעובד!

**בהצלחה!** 🚀

---

## 📞 עזרה

אם יש בעיה:
1. בדוק את הלוגים ב-Render
2. בדוק את הלוגים ב-Lovable (אחרי סנכרון)
3. אם לא עוזר - שלח לי את השגיאה!
