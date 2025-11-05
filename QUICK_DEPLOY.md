# ⚡ Quick Deploy Guide - 5 Minuten zum Live-System

## 🔥 BACKEND: Render.com (Schritt 1-5)

### 1️⃣ Account erstellen
**Sie sind hier:** https://render.com

**KLICKEN SIE:** Den blauen Button "**Get Started for Free**" (oben rechts)
- Wählen Sie: "**Continue with GitHub**"
- Autorisieren Sie Render (einmalig)
- ✅ Account erstellt!

### 2️⃣ Neuen Web Service erstellen
**Im Render Dashboard:**

**KLICKEN SIE:** "**New +**" → "**Web Service**"

**WÄHLEN SIE:** Ihr Repository "**mariomuja/bookkeeping**"
- Falls nicht sichtbar: "Configure account" → Zugriff für Render erlauben

### 3️⃣ Service konfigurieren

**Wichtige Einstellungen:**
```
Name:           international-bookkeeping-api
Region:         Frankfurt (EU Central)
Branch:         main
Root Directory: (LEER LASSEN)
Runtime:        Node
Build Command:  cd bookkeeping-backend && npm install
Start Command:  cd bookkeeping-backend && node server.js
Instance Type:  Free
```

### 4️⃣ Environment Variables setzen

**Scrollen Sie runter zu "Environment Variables"**

**KLICKEN SIE:** "Add Environment Variable" und fügen Sie hinzu:

```
NODE_ENV = production
PORT = 3000
USE_MOCK_DATA = true
CORS_ORIGIN = https://international-bookkeeping.vercel.app
```

**WICHTIG:** Die CORS_ORIGIN URL werden Sie später mit Ihrer echten Vercel-URL aktualisieren!

### 5️⃣ Deploy starten

**KLICKEN SIE:** Den blauen Button "**Create Web Service**"

⏱️ **Warten Sie 2-3 Minuten** (Sie sehen Live-Logs)

✅ **FERTIG!** Ihre Backend-URL: `https://international-bookkeeping-api.onrender.com`

**TESTEN SIE:** Öffnen Sie `https://international-bookkeeping-api.onrender.com/api/health`
- Sollte zeigen: `{"status":"ok","version":"1.0.0",...}`

---

## 🎨 FRONTEND: Vercel (Schritt 6-10)

### 6️⃣ Vercel Account erstellen
**Öffnen Sie:** https://vercel.com

**KLICKEN SIE:** "**Sign Up**" (oben rechts)
- Wählen Sie: "**Continue with GitHub**"
- Autorisieren Sie Vercel
- ✅ Account erstellt!

### 7️⃣ Projekt importieren

**Im Vercel Dashboard:**

**KLICKEN SIE:** "**Add New...**" → "**Project**"

**WÄHLEN SIE:** Repository "**mariomuja/bookkeeping**"
- Klicken Sie "**Import**"

### 8️⃣ Projekt konfigurieren

**WICHTIG - Ändern Sie diese Einstellungen:**

```
Framework Preset:    Other (oder Angular falls verfügbar)
Root Directory:      bookkeeping-frontend   ⬅️ SEHR WICHTIG!
Build Command:       npm run vercel-build   (Standard ist OK)
Output Directory:    dist/bookkeeping-frontend/browser   (Standard ist OK)
Install Command:     npm install   (Standard ist OK)
```

**So ändern Sie Root Directory:**
1. Finden Sie "Root Directory"
2. Klicken Sie "Edit"
3. Wählen Sie aus Dropdown: "**bookkeeping-frontend**"

### 9️⃣ Deploy starten

**KLICKEN SIE:** Den blauen Button "**Deploy**"

⏱️ **Warten Sie 2-3 Minuten**

✅ **FERTIG!** Sie sehen Ihre URL: `https://international-bookkeeping-abc123.vercel.app`

**KOPIEREN SIE** diese URL! (Sie brauchen sie gleich)

### 🔟 CORS aktualisieren (WICHTIGER LETZTER SCHRITT!)

**Zurück zu Render:**
1. Gehen Sie zu Render Dashboard
2. Klicken Sie auf Ihren Service "international-bookkeeping-api"
3. Gehen Sie zu "**Environment**" Tab
4. Finden Sie `CORS_ORIGIN`
5. Klicken Sie "Edit"
6. **Ersetzen Sie** mit Ihrer echten Vercel-URL (die Sie gerade kopiert haben)
   ```
   CORS_ORIGIN = https://international-bookkeeping-abc123.vercel.app
   ```
   (Verwenden Sie Ihre echte URL!)
7. Klicken Sie "**Save Changes**"
8. Render deployed automatisch neu (~1 Minute)

---

## 🎉 GESCHAFFT!

**Öffnen Sie Ihre Vercel-URL:**
`https://international-bookkeeping-abc123.vercel.app`

**Login:** `demo` / `demo123`

**Teilen Sie diese URL mit jedem!** 🚀

---

## ⚠️ Bekannte Eigenheit (Render Free Tier)

- Backend "schläft" nach 15 Min Inaktivität
- Erste Anfrage nach Schlaf: ~30 Sekunden Wartezeit
- Danach: Sofort schnell
- **Lösung**: Upgrade auf $7/Monat für Always-On

---

## 🆘 Probleme?

**"Backend Connectivity Error":**
- Prüfen Sie CORS_ORIGIN in Render
- Muss EXAKT Ihre Vercel-URL sein (mit https://)

**"Application Not Found":**
- Warten Sie 1-2 Minuten mehr
- Backend startet beim ersten Aufruf

**Andere Fehler:**
- Schauen Sie in Render → Logs
- Schauen Sie in Vercel → Deployment Logs

