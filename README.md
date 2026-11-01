# SymbioCarb AI (منظومة سيمبيوكارب للذكاء الصناعي والكربون)
> **Enterprise B2B SaaS Platform for Tunisian Industrial SMEs & Agro-Industries**  
> *EU CBAM Compliance • STEG MT/HT Energy Optimization • ANME FTE Subsidies • BioClaira Circular Symbiosis • Shop-Floor DarjaBot*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSeifElouaer%2Fsymbiocarb-ai&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,GEMINI_API_KEY,TELEGRAM_BOT_TOKEN,TELEGRAM_DEFAULT_CHAT_ID,NEXT_PUBLIC_DEFAULT_LOCALE,NEXT_PUBLIC_APP_URL)

---

## 🌟 Executive Summary & Tunisian Industrial Context
Over **70% of Tunisian industrial exports** are targeted towards the European Union. Exporting manufacturers (mechanical machining, automotive cables, olive oil mills, date conditioning, textile/apparel, building materials) face four critical bottlenecks:
1. **EU CBAM (MACF) & ISO 14064 Compliance:** Starting from mandatory enforcement of Regulation (EU) 2023/956, Tunisian exporters must declare exact Specific Embedded Emissions ($SEE$) per finished metric ton (CN 8-digit codes) or pay heavy carbon border taxes under the EU ETS (€85/tCO₂e).
2. **STEG MT/HT Tariffs & Reactive Penalties:** Tunisian factories face complex Medium/High Voltage time-of-use tariffs (*Jour, Pointe, Soir, Nuit*), extreme power factor penalties ($\cos \varphi < 0.85$), and power overrun charges (*dépassement de puissance souscrite*).
3. **Circular Agro-Waste Valorization (Powered by BioClaira Models):** Over 100,000 tons of date pits and 300,000 tons of olive pomace (*grignons*) are dumped or under-utilized annually in Tunisia. SymbioCarb AI embeds deterministic kinetic pyrolysis models to simulate conversion into high-value activated carbon (BET > 1,150 m²/g), substituting expensive fossil imports.
4. **Native Trilingual Engine (`FR` | `EN` | `AR-TN` RTL) & DarjaBot Shop-Floor Copilot:** Full native support in French, English, and Tunisian Arabic with instant dynamic RTL switching, paired with a real-time **Telegram Bot (`DarjaBot`) + In-App Mobile Simulator** interacting in authentic Tunisian Darija via text and voice notes.

---

## 🚀 Key Modules & Engineering Depth

### 1. Module A: Multimodal STEG Document AI (Gemini 2.5 Flash Vision)
- Split-screen verification UI with animated scanner overlay.
- Multimodal extraction of French/Arabic STEG Medium Voltage invoices and SONEDE water slips.
- Extracts active energy split (*Jour, Pointe, Soir, Nuit*), reactive energy $kVARh$, calculated $\cos \varphi$, power overrun, FTR, municipal taxes, and total TTC in TND with confidence scores.

### 2. Module B: Multilingual Vector RAG & EU CBAM Generator
- Powered by `text-embedding-004` (768 dimensions) with Supabase `pgvector` Cosine Similarity matcher (`match_emission_factors` RPC).
- Seamlessly maps raw purchase items in French, English, or Tunisian Arabic (e.g. *"Bobines acier laminé à froid"*, *"Cold rolled coils"*, *"لفائف حديد وصلب"*) to exact **CN 8-digit customs codes** and $\text{kgCO}_2\text{e}$ factors.
- Deterministic calculation of Specific Embedded Emissions ($SEE$) and 1-Click official **EU CBAM XML Communication file** generator compliant with European Commission Annex IV.

### 3. Module C: Operations Research STEG & ANME FTE Solver
- **Deterministic $\cos \varphi$ Compensation Optimizer:**
  $$Q_c (\text{kVAR}) = P_{\text{active}} \times (\tan \varphi_1 - \tan \varphi_2)$$
  Calculates required capacitor bank sizing, eliminated monthly penalties, Joule loss reduction, CAPEX in TND, payback in months, and harmonic resonance risk checks (recommending detuned reactors 189 Hz).
- **Flexible Load Shifting LP:** Simulates moving non-critical machines (mills, crushers, chillers) from expensive *Pointe* (0.412 TND/kWh) to *Nuit* (0.188 TND/kWh), saving 0.224 TND/kWh.
- **ANME FTE Grant Assistant:** Automatic qualification for 70% audit subsidies (up to 30,000 TND) and 20% equipment investment grants.

### 4. Module D: BioClaira Pyrolysis & Industrial Symbiosis Hub
- Kinetic mass-energy balance simulator for Deglet Nour date pits and olive grignons.
- Inputs: Moisture %, pyrolysis temperature (450°C–850°C), activation agent ($\text{H}_3\text{PO}_4$, Steam, $\text{KOH}$).
- Outputs: Activated carbon yield %, BET surface area ($\text{m}^2/\text{g}$), iodine number, net annual profit in TND, and avoided net greenhouse gas emissions (accounting for avoided landfill methane and fossil coal replacement).
- 3D geospatial interactive network connecting Tunisian industrial zones (Ben Arous, Mghira, Sfax Thyna, Tozeur, Bizerte, Gabès).

### 5. Module E: "DarjaBot" — Live Telegram Copilot & In-App Mobile Simulator
- **Live Outbound Push (`/api/telegram/send`):** Sends real notifications with interactive inline buttons directly to the user's Telegram phone (`chat_id: 6318474502`).
- **Bidirectional Inbound Sync (`/api/telegram/sync`):** 1-Click polling mechanism using `getUpdates` allowing full local testing without ngrok.
- **Multimodal Darija AI:** Understands and generates authentic Tunisian Darija (both Arabic script and Arabizi) via Gemini 2.5 Flash for shop-floor technicians.
- **In-App Mobile Simulator Drawer:** Floating smartphone UI mirroring the Telegram conversation in real time with browser voice recording support.

---

## 🛠️ Architecture & Tech Stack
- **Framework:** Next.js 15.1.7 (App Router, React 19, TypeScript strict mode)
- **Styling & UI:** Tailwind CSS, custom Obsidian dark theme, glassmorphism panels, RTL logical properties (`ms-*`, `me-*`), Lucide Icons
- **Typography:** `Cairo` & `IBM Plex Sans Arabic` (Arabic), `Inter` (Latin), `JetBrains Mono` (Engineering numerals)
- **Database:** Supabase PostgreSQL 15 + `pgvector` extension (768 dimensions)
- **AI SDK:** Google Gemini 2.5 Flash Multimodal Vision & Audio + `text-embedding-004`
- **Charts:** Recharts (4-period MT load curve)

---

## 🏭 Demo Personas (Switchable in 1-Click from Top Navbar)
1. **Ben Arous Precision Mechanics (Export UE):** Heavy reactive power penalty ($\cos \varphi = 0.748$), direct EU CBAM export reporting for steel/aluminum.
2. **Tozeur Sahara Dates & BioClaira Unit:** 24/7 cold storage refrigeration + 600t date pits valorized into high-grade activated carbon.
3. **Sfax Olive Oil & Agro-Industrial Facility:** Seasonal crushing peak load, STEG MT Pointe exposure, olive pomace and margines valorization.

---

## 🚀 Running the Platform Locally
```bash
# Start the production web server
npm run start -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

