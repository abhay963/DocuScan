# 📄 DocuScan — AI Document Extraction

<p align="center">
  <b>Turn any PDF into structured, machine-readable JSON using OCR + AI.</b>
</p>

<p align="center">
  <a href="https://docu-scan-red.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-DocuScan-2563EB?style=for-the-badge" />
  </a>
</p>



---

## 🚀 Live Demo

### 👉 [DocuScan — AI Document Extraction](https://docu-scan-red.vercel.app/)

Upload a PDF and DocuScan will extract readable text, identify meaningful entities using AI, and return structured JSON.

---

## ✨ Features

- 📄 **PDF Upload** — Process PDF documents through a REST API
- 🔍 **Smart Text Extraction** — Extracts text directly from digital PDFs
- 👁️ **OCR Fallback** — Uses Tesseract.js for scanned PDFs
- 🤖 **AI Entity Extraction** — Dynamically identifies meaningful entities
- 🧩 **Document Chunking** — Handles larger document content efficiently
- ♻️ **Deduplication** — Removes repeated entities
- 📊 **Confidence Scores** — Returns confidence for extracted entities
- ⚡ **Structured JSON** — Clean, machine-readable API response
- 🎨 **Interactive UI** — Simple React-based document processing interface

---

## 🧠 How It Works

```text
            📄 PDF Upload
                  │
                  ▼
        🔍 PDF Text Extraction
                  │
            Enough Text?
             /         \
           YES          NO
            │            │
            │       👁️ OCR
            │       Tesseract
            │            │
            └──────┬─────┘
                   ▼
              🧹 Clean Text
                   │
                   ▼
              🧩 Chunking
                   │
                   ▼
             🤖 Groq AI
                   │
                   ▼
          🏷️ Entity Extraction
                   │
                   ▼
           ♻️ Deduplication
                   │
                   ▼
             { JSON } ⚡
```

---

## 🤖 Dynamic Entity Extraction

DocuScan is **not limited to invoices**. It can dynamically extract entities from different types of documents.

```text
👤 PERSON          🏢 ORGANIZATION
📍 LOCATION        📧 EMAIL
☎️ PHONE           📅 DATE
💰 AMOUNT          🔗 URL
🧾 INVOICE_NUMBER  💼 JOB_TITLE
🛠️ SKILL           📦 PRODUCT
📑 CONTRACT        🔢 REFERENCE_NUMBER
```

The AI is instructed to extract only information explicitly present in the document and avoid guessing missing information.

---

## 📤 Example Response

```json
{
  "success": true,
  "document": {
    "fileName": "sample_invoice.pdf",
    "mimeType": "application/pdf",
    "pageCount": 1
  },
  "extraction": {
    "source": "pdf-text",
    "textLength": 542
  },
  "entities": [
    {
      "type": "ORGANIZATION",
      "value": "Acme Technologies",
      "confidence": 0.98,
      "page": 1
    },
    {
      "type": "AMOUNT",
      "value": "$1,250",
      "confidence": 0.97,
      "page": 1
    }
  ]
}
```

---

## 🛠️ Tech Stack

<p align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=for-the-badge)
![Tesseract](https://img.shields.io/badge/Tesseract-OCR-blue?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</p>

---

## 📁 Project Structure

```text
DocuScan/
│
├── backend/
│   └── src/
│       ├── server.js
│       ├── routes/
│       │   └── document.routes.js
│       └── services/
│           └── document.service.js
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
└── README.md
```

---

## ⚙️ Run Locally

### 1. Clone

```bash
git clone https://github.com/abhay963/DocuScan.git
cd DocuScan
```

### 2. Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key
```

Run:

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 Processing Pipeline

```text
PDF → Text Extraction → OCR Fallback → Cleaning
    → Chunking → AI Extraction → Validation
    → Deduplication → Structured JSON
```

This hybrid approach avoids unnecessary OCR for digital PDFs while still supporting scanned documents.

---

## 🔮 Future Improvements

- 🌍 Multi-language OCR
- 📊 Table extraction
- 🔐 Authentication & rate limiting
- ☁️ Cloud document storage
- 📚 Document history
- 🔎 Semantic document search
- ⚙️ Background job processing

---

## 👨‍💻 Author

**Abhay Kumar Yadav**

Built with ❤️ using **React, Node.js, Express, Tesseract OCR & Groq AI**.

<p align="center">
  <a href="https://docu-scan-red.vercel.app/">
    <img src="https://img.shields.io/badge/Try_DocuScan_Now-🚀-2563EB?style=for-the-badge" />
  </a>
</p>

---

<p align="center">
  <b>📄 PDF → 👁️ OCR → 🤖 AI → 🏷️ Entities → ⚡ JSON</b>
</p>

<p align="center">
  ⭐ If you like DocuScan, consider starring the repository!
</p>
