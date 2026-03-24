# 🔎 Problem Discovery Engine

## 🎯 The Motive
The **Problem Discovery Engine** is built on the core insight that **people don’t struggle with "ideas," they struggle with finding "real problems" worth solving.** 

Most idea generators provide generic, AI-invented concepts. This application reverses that process by identifying actual human complaints from online forums (currently Reddit), clustering them with AI, and suggesting valid, data-driven startup opportunities.

---

## 🛠 What This Application Does

### 1. 🔎 Real-World Pain Point Discovery
When you enter a keyword (e.g., "SaaS" or "Postgres"), the engine searches Reddit for posts containing markers of genuine frustration like *"I hate it when,"* *"Why is it so painful,"* or *"Is there any tool for."*

### 2. 🧠 AI Problem Clustering
It feeds the raw Reddit text into **Gemini 2.5 Flash**. The AI performs a "market research" role—identifying repeating themes across disparate posts and grouping them into **5 distinct "Problem Clusters."**

### 3. 📊 Quantitative Validation
For every cluster, the engine calculates:
- **Frequency**: An estimate of the number of users affected.
- **Severity**: A 1-10 rating of how painful the specific problem is.
- **User Pain Summary**: A clear, concise breakdown of exactly what is frustrating people.

### 4. ⚡ Suggested Technical MVP
To help you move from "problem" to "prototype," the engine provides:
- **Solution Idea**: A specific product or feature to solve the cluster.
- **Tech Stack**: Recommended modern tools (React, Node.js, MongoDB, etc.) to build the MVP.

---

## 🚀 Technical Stack
- **Frontend**: React (Vite) + Tailwind CSS v4 + Framer Motion
- **Backend**: Node.js + Express (Modular ES Module Architecture)
- **AI**: Google Generative AI (Gemini 2.5/2.0/Pro)
- **Scraper**: Reddit Search API (via public JSON endpoints)

---

## ⚙️ Quick Setup
1. **Environment**: Add your `GEMINI_API_KEY` to `server/.env`.
2. **Backend**: `cd server && npm run dev`
3. **Frontend**: `cd client && npm run dev`

---

*“Stop building what nobody needs. Start building what people are already complaining about.”* 🚀
