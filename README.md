# 📄 DocuScan

### AI-Powered PDF → OCR → Entity Extraction → JSON

> **Turn any PDF into structured, machine-readable data.**

DocuScan is an **API-based intelligent document processing system** that accepts PDF documents through a REST API, extracts their content using **native PDF text extraction or OCR**, and uses an LLM to identify meaningful entities dynamically and return them as structured JSON.

It is designed to work with **different types of documents** rather than being restricted to a single fixed document format such as invoices.

---

## ✨ What Does DocuScan Do?

Imagine you upload a PDF containing:

- 👤 People
- 🏢 Organizations
- 📍 Locations
- 📧 Email addresses
- ☎️ Phone numbers
- 📅 Dates
- 💰 Amounts
- 🔗 URLs
- 🧾 Invoice numbers
- 📦 Products
- 📑 Contracts
- 🔢 Reference numbers
- 💼 Job titles
- 🛠️ Skills
- And other meaningful information

DocuScan automatically processes the document and produces structured JSON.

### The flow

```text
                    ┌─────────────────┐
                    │    PDF Upload   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   REST API      │
                    │  POST /documents│
                    └────────┬────────┘
                             │
                             ▼
                 ┌──────────────────────┐
                 │ PDF Text Extraction  │
                 └──────────┬───────────┘
                            │
                    Text available?
                       /          \
                     YES           NO
                      │             │
                      │             ▼
                      │      ┌─────────────┐
                      │      │ OCR Fallback│
                      │      └──────┬──────┘
                      │             │
                      └──────┬──────┘
                             ▼
                    ┌─────────────────┐
                    │   Text Cleaning │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Chunking        │
                    │ Large Documents │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Groq LLM       │
                    │ Entity Extraction│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Validation &    │
                    │ Deduplication   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Structured JSON │
                    └─────────────────┘
```

---

# 🚀 Live Demo

### 🌐 Backend API

**Production API:**

`https://docuscan-ex5s.onrender.com`

### ❤️ Health Check

Open:

`https://docuscan-ex5s.onrender.com/`

Expected response:

```json
{
  "success": true,
  "message": "DocuScan OCR API is running"
}
```

---

# 🎯 Key Features

| Feature | Description |
|---|---|
| 📄 PDF Upload | Upload PDF documents through REST API |
| 🔍 PDF Text Extraction | Extract text directly from text-based PDFs |
| 👁️ OCR Fallback | Automatically OCR scanned/image-based PDFs |
| 🤖 AI Entity Extraction | Uses Groq-powered LLM extraction |
| 🧠 Dynamic Entities | Works with different document types |
| 📦 Chunk Processing | Handles larger documents efficiently |
| 🧹 Text Cleaning | Removes unnecessary formatting noise |
| ♻️ Deduplication | Removes duplicate entities |
| 📊 Confidence Scores | Every entity receives a confidence score |
| 📑 Page Information | Tracks page number when available |
| 🔒 Input Validation | Only PDF files are accepted |
| 📏 File Size Protection | Upload size is limited |
| 🌐 REST API | Simple API integration |
| ⚡ JSON Response | Machine-readable structured output |
| ☁️ Cloud Deployment | Backend deployed on Render |

---

# 🧠 Why Hybrid PDF Extraction + OCR?

Not every PDF contains actual text.

There are two common types of PDFs:

### 1️⃣ Text-Based PDF

Example:

```text
A digitally generated invoice
A generated resume
A digital contract
A PDF report
```

These already contain machine-readable text.

DocuScan first tries:

```text
PDF → Text Extraction
```

This is:

- Faster ⚡
- Cheaper 💰
- More reliable for digital PDFs

---

### 2️⃣ Scanned / Image-Based PDF

A scanned document may essentially contain images:

```text
PDF
 ↓
Image
 ↓
No actual text layer
```

In that case, normal PDF parsing may return little or no useful text.

DocuScan automatically switches to:

```text
PDF
 ↓
Page Images
 ↓
Tesseract OCR
 ↓
Extracted Text
```

This makes the system capable of handling scanned documents as well.

---

# 🤖 AI-Powered Entity Extraction

Once text has been extracted, DocuScan sends it to a Groq-powered LLM.

The model is instructed to:

- Extract only explicitly mentioned information
- Never invent missing information
- Never guess
- Determine entity types dynamically
- Preserve entity values
- Avoid duplicate entities
- Return valid JSON
- Provide confidence scores
- Include page information when available

### Example Input

```text
John Smith works at Acme Technologies.

Email: john.smith@example.com

Location: New Delhi, India

Invoice Number: INV-2026-001

Total Amount: $1,250
```

### Example Output

```json
{
  "entities": [
    {
      "type": "PERSON",
      "value": "John Smith",
      "confidence": 0.98,
      "page": 1
    },
    {
      "type": "ORGANIZATION",
      "value": "Acme Technologies",
      "confidence": 0.97,
      "page": 1
    },
    {
      "type": "EMAIL",
      "value": "john.smith@example.com",
      "confidence": 0.99,
      "page": 1
    },
    {
      "type": "LOCATION",
      "value": "New Delhi, India",
      "confidence": 0.96,
      "page": 1
    },
    {
      "type": "INVOICE_NUMBER",
      "value": "INV-2026-001",
      "confidence": 0.99,
      "page": 1
    },
    {
      "type": "AMOUNT",
      "value": "$1,250",
      "confidence": 0.98,
      "page": 1
    }
  ]
}
```

---

# 🔥 Dynamic Entity Types

DocuScan is **not hardcoded to invoices**.

Instead of assuming:

```text
invoice_number
customer_name
total_amount
```

the system allows the AI to determine the semantic type based on the document.

For example:

### Resume

```text
PERSON
JOB_TITLE
SKILL
ORGANIZATION
EMAIL
PHONE
LOCATION
```

### Invoice

```text
INVOICE_NUMBER
AMOUNT
CURRENCY
PRODUCT
ORGANIZATION
DATE
```

### Contract

```text
PERSON
ORGANIZATION
CONTRACT
DATE
LOCATION
REFERENCE_NUMBER
```

### Research Paper

```text
PERSON
ORGANIZATION
DATE
LOCATION
PRODUCT
REFERENCE_NUMBER
```

This makes DocuScan suitable for **general-purpose document intelligence**.

---

# 📦 Large Document Handling

Large PDFs can contain thousands of words.

Sending the entire document to an LLM in one request is inefficient and may exceed context limits.

DocuScan therefore uses:

```text
Large Document
      ↓
Clean Text
      ↓
Split Into Chunks
      ↓
Chunk 1 → LLM
      ↓
Chunk 2 → LLM
      ↓
Chunk 3 → LLM
      ↓
...
      ↓
Combine Results
      ↓
Deduplicate
      ↓
Final JSON
```

The backend currently uses approximately:

```text
Chunk size: 4500 characters
```

and processes chunks sequentially.

This approach helps control:

- Context size
- API usage
- Memory usage
- Large-document processing

---

# 🏗️ System Architecture

```text
                         CLIENT
                           │
                           │ multipart/form-data
                           ▼
                  ┌───────────────────┐
                  │   Express REST    │
                  │       API         │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │      Multer       │
                  │  PDF Validation   │
                  └─────────┬─────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │   PDF Parser      │
                  │   pdf-parse       │
                  └─────────┬─────────┘
                            │
                   ┌────────┴────────┐
                   │                 │
             Text Found        No Text
                   │                 │
                   │                 ▼
                   │          ┌────────────┐
                   │          │ Tesseract  │
                   │          │    OCR     │
                   │          └─────┬──────┘
                   │                │
                   └────────┬───────┘
                            ▼
                    ┌───────────────┐
                    │ Clean Text    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Text Chunking │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  Groq LLM     │
                    │ Entity Engine │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Normalize     │
                    │ Entities      │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Deduplicate   │
                    └───────┬───────┘
                            │
                            ▼
                         JSON
```

---

# 🛠️ Tech Stack

## Backend

- **Node.js**
- **Express.js**
- **Multer**
- **pdf-parse**
- **pdfjs-dist**
- **Tesseract.js**
- **Groq SDK**
- **dotenv**
- **CORS**

## Frontend

- **React**
- **Vite**
- **CSS**
- **React Toastify**
- **React Icons**

## AI

- **Groq API**
- **OpenAI GPT-OSS 120B**

## Deployment

- **Render**

---

# 📁 Project Structure

```text
DocuScan/
│
├── backend/
│   │
│   ├── src/
│   │   ├── server.js
│   │   │
│   │   ├── routes/
│   │   │   └── document.routes.js
│   │   │
│   │   └── services/
│   │       └── document.service.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   └── .gitignore
│
├── frontend/
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   ├── vite.config.js
│   └── index.html
│
└── README.md
```

---

# ⚙️ Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/abhay963/DocuScan.git
```

```bash
cd DocuScan
```

---

# 🔧 Backend Setup

Move into the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
npm start
```

For development:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:5000
```

---

# 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/
```

Start the frontend:

```bash
npm run dev
```

Vite will provide a local URL such as:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

### Backend

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/
```

For production:

```env
VITE_API_URL=https://docuscan-ex5s.onrender.com/
```

> ⚠️ Never commit your `.env` file or API keys to GitHub.

Make sure `.gitignore` contains:

```text
.env
node_modules
dist
```

---

# 📡 API Documentation

## Upload and Process PDF

### Endpoint

```http
POST /api/v1/documents/
```

### Production

```text
https://docuscan-ex5s.onrender.com/api/v1/documents/
```

### Request

Content-Type:

```text
multipart/form-data
```

Form field:

```text
file
```

The field must contain a PDF file.

---

# 🧪 Test with Postman

You can test the API without the frontend.

### Step 1

Create a new request:

```text
POST
```

### Step 2

Use:

```text
https://docuscan-ex5s.onrender.com/api/v1/documents/
```

### Step 3

Go to:

```text
Body
→ form-data
```

Add:

| Key | Type | Value |
|---|---|---|
| `file` | File | `sample.pdf` |

### Step 4

Click:

```text
Send
```

Expected:

```text
200 OK
```

---

# 📤 API Response

Example:

```json
{
  "success": true,
  "document": {
    "fileName": "sample_invoice.pdf",
    "mimeType": "application/pdf",
    "size": 2516,
    "pageCount": 1
  },
  "extraction": {
    "source": "pdf-text",
    "textLength": 500
  },
  "entities": [
    {
      "type": "PERSON",
      "value": "John Smith",
      "confidence": 0.98,
      "page": 1
    },
    {
      "type": "ORGANIZATION",
      "value": "Acme Technologies",
      "confidence": 0.97,
      "page": 1
    }
  ]
}
```

---

# 🔄 Extraction Sources

The response tells you how the text was obtained.

### Native PDF extraction

```json
{
  "source": "pdf-text"
}
```

This means the PDF already contained machine-readable text.

### OCR extraction

```json
{
  "source": "ocr"
}
```

This means the PDF required OCR processing.

---

# 🧩 API Error Handling

DocuScan handles several common failures.

### No file

```json
{
  "success": false,
  "message": "PDF file is required"
}
```

### Invalid file type

```json
{
  "success": false,
  "message": "Only PDF files are allowed"
}
```

### File too large

```json
{
  "success": false,
  "message": "PDF size cannot exceed 10 MB"
}
```

### Processing failure

```json
{
  "success": false,
  "message": "Failed to process document"
}
```

---

# 🔒 Security Considerations

The current implementation includes basic API protections:

### File type validation

Only:

```text
application/pdf
```

is accepted.

### File size limit

Current maximum:

```text
10 MB
```

### API key protection

The Groq API key is loaded from:

```text
.env
```

rather than being hardcoded.

### No persistent document storage

The current architecture processes the uploaded PDF in memory and does not require permanent document storage.

This keeps the assignment implementation simple.

---

# ⚡ Performance Strategy

DocuScan uses several techniques to improve processing efficiency.

### 1. Direct PDF extraction first

Avoid OCR when the PDF already contains text.

```text
PDF
 ↓
Text extraction
 ↓
Enough text?
 ↓
YES → Continue
```

This avoids unnecessary OCR computation.

---

### 2. OCR only when necessary

For scanned PDFs:

```text
PDF
 ↓
Text extraction
 ↓
Insufficient text
 ↓
OCR
```

---

### 3. Chunking

Large extracted text is split before sending it to the LLM.

```text
4500 characters
       ↓
LLM
```

instead of sending the complete document at once.

---

### 4. Sequential processing

Chunks are processed sequentially to avoid unnecessarily sending many simultaneous requests.

---

### 5. Deduplication

Entities from multiple chunks are merged and duplicates are removed.

For example:

```text
PERSON → John Smith
PERSON → John Smith
PERSON → John Smith
```

becomes:

```text
PERSON → John Smith
```

---

# 🧠 Entity Normalization

Before returning the final response, entities are normalized.

The system ensures:

```text
type       → string
value      → string
confidence → 0 to 1
page       → integer or null
```

Example:

```json
{
  "type": "PERSON",
  "value": "John Smith",
  "confidence": 0.98,
  "page": 2
}
```

This provides a predictable response structure for frontend and downstream applications.

---

# 🎨 Frontend Experience

The frontend provides a simple document-processing workflow:

```text
Upload PDF
    ↓
Uploading
    ↓
Processing
    ↓
Extracting
    ↓
Validating
    ↓
Completed
```

It also provides:

- Drag & drop style upload experience
- File information
- Processing progress
- Chunk-processing visualization
- Error notifications
- Entity results
- JSON-oriented output

---

# 🔌 REST API Architecture

The API is intentionally kept simple.

```text
POST /api/v1/documents/
```

This makes it easy to integrate DocuScan into:

- HR systems
- Invoice processing
- Document management systems
- Contract management
- Recruitment systems
- Internal enterprise tools
- Data extraction pipelines
- AI workflows

A client only needs to send:

```text
PDF
```

and receives:

```text
Structured JSON
```

---

# 🌍 Example Use Cases

## 👨‍💼 Recruitment

Upload:

```text
candidate_resume.pdf
```

Extract:

```text
PERSON
EMAIL
PHONE
SKILLS
JOB_TITLE
ORGANIZATION
LOCATION
```

---

## 🧾 Invoice Processing

Upload:

```text
invoice.pdf
```

Extract:

```text
INVOICE_NUMBER
DATE
ORGANIZATION
AMOUNT
CURRENCY
PRODUCT
```

---

## 📑 Contract Analysis

Upload:

```text
employment_contract.pdf
```

Extract:

```text
PERSON
ORGANIZATION
DATE
CONTRACT
LOCATION
REFERENCE_NUMBER
```

---

## 🏢 Enterprise Documents

Upload:

```text
company_report.pdf
```

Extract:

```text
ORGANIZATION
PERSON
DATE
LOCATION
AMOUNT
REFERENCE_NUMBER
```

---

# 🧪 Testing

The API can be tested using:

### Postman

```text
POST /api/v1/documents/
```

### Frontend

Upload a PDF through the DocuScan interface.

### Browser

Health check:

```text
GET /
```

Expected:

```json
{
  "success": true,
  "message": "DocuScan OCR API is running"
}
```

---

# 📊 Current Limits

| Limit | Current Value |
|---|---:|
| Maximum PDF size | 10 MB |
| Chunk size | ~4500 characters |
| Maximum entities / chunk | 30 |
| OCR engine | Tesseract.js |
| AI provider | Groq |
| API style | REST |
| Response format | JSON |

---

# 🚀 Production Improvements

The current implementation is intentionally lightweight. For a larger production deployment, the architecture could be extended with:

```text
                  API
                   │
                   ▼
              Load Balancer
                   │
                   ▼
             Upload Service
                   │
                   ▼
                S3 / Blob
                   │
                   ▼
             Message Queue
                   │
          ┌────────┴────────┐
          ▼                 ▼
      OCR Worker       PDF Worker
          │                 │
          └────────┬────────┘
                   ▼
             Entity Worker
                   │
                   ▼
              Vector DB
                   │
                   ▼
              PostgreSQL
```

Potential improvements include:

- ☁️ Object storage such as S3
- 📨 Message queues
- ⚙️ Background workers
- 🔄 Retry mechanisms
- 📊 Monitoring
- 📝 Structured logging
- 🔐 Authentication & authorization
- 🗄️ Persistent document metadata
- ⚡ Parallel chunk processing
- 💾 Caching
- 📈 Rate limiting
- 🧪 Automated tests
- 📦 Docker
- 🔍 Observability
- 🧠 Better OCR preprocessing

---

# 🏆 Design Decisions

### Why not OCR every PDF?

Because OCR is computationally expensive and unnecessary when a PDF already contains selectable text.

Therefore:

```text
Try PDF extraction first
        ↓
OCR only if necessary
```

---

### Why chunk documents?

Large documents can exceed model context limits and increase processing cost.

Therefore:

```text
Document
 ↓
Chunks
 ↓
LLM
 ↓
Merge
```

---

### Why dynamic entities?

A generic document processing system should not assume that every document is an invoice, resume, or contract.

Therefore the LLM is instructed to determine meaningful entity types based on document content.

---

### Why JSON?

JSON makes the output easy for software systems to consume.

For example:

```javascript
const entities = response.entities;
```

can immediately be used by another service, database, dashboard, or workflow.

---

# 📈 Future Roadmap

The project can evolve into a complete intelligent document platform.

### Phase 1 — Current

- [x] PDF upload
- [x] REST API
- [x] PDF text extraction
- [x] OCR fallback
- [x] AI entity extraction
- [x] Dynamic entity types
- [x] Chunking
- [x] Deduplication
- [x] JSON response
- [x] Frontend
- [x] Render deployment

### Phase 2

- [ ] Authentication
- [ ] Rate limiting
- [ ] API keys
- [ ] Persistent document history
- [ ] Database integration
- [ ] S3 document storage
- [ ] Background processing
- [ ] Job status API

### Phase 3

- [ ] Multi-language OCR
- [ ] Table extraction
- [ ] Layout-aware extraction
- [ ] Document classification
- [ ] Search across documents
- [ ] Vector database
- [ ] Semantic search
- [ ] RAG pipeline

### Phase 4

- [ ] Enterprise authentication
- [ ] Role-based access control
- [ ] Usage analytics
- [ ] Audit logs
- [ ] Horizontal scaling
- [ ] Distributed workers
- [ ] Advanced observability

---

# 🧑‍💻 Development Philosophy

DocuScan follows a few simple principles:

```text
Keep the API simple.
        ↓
Extract text efficiently.
        ↓
Use OCR only when necessary.
        ↓
Use AI for semantic understanding.
        ↓
Validate the output.
        ↓
Return predictable JSON.
```

The goal is not to build an unnecessarily complex architecture.

The goal is to create a system that is:

**Simple → Reliable → Extensible → AI-powered**

---

# 📝 Example End-to-End Flow

Suppose a user uploads:

```text
employment_contract.pdf
```

### Step 1 — Upload

```http
POST /api/v1/documents/
```

### Step 2 — PDF parsing

```text
Extract text from PDF
```

### Step 3 — OCR fallback

If the PDF is scanned:

```text
PDF → Images → Tesseract → Text
```

### Step 4 — Cleaning

```text
Raw Text
   ↓
Clean Text
```

### Step 5 — Chunking

```text
Large Text
   ↓
Chunk 1
Chunk 2
Chunk 3
```

### Step 6 — AI extraction

```text
Chunk
 ↓
Groq
 ↓
Entities
```

### Step 7 — Merge

```text
Chunk 1 entities
+
Chunk 2 entities
+
Chunk 3 entities
```

### Step 8 — Deduplicate

```text
Unique entities
```

### Step 9 — Response

```json
{
  "success": true,
  "entities": [...]
}
```

---

# 🌟 Why DocuScan?

Traditional PDF processing often gives you:

```text
PDF → Raw Text
```

DocuScan goes one step further:

```text
PDF
 ↓
OCR / Text Extraction
 ↓
AI Understanding
 ↓
Entity Extraction
 ↓
Validation
 ↓
Structured JSON
```

That makes the output immediately useful for software systems.

---

# 📜 License

This project is developed as a software engineering / AI document processing project.

You are free to use the architecture and ideas for learning and experimentation.

---

# 👨‍💻 Author

**Abhay Kumar Yadav**

Built with:

```text
React
+
Node.js
+
Express
+
Tesseract OCR
+
Groq AI
+
REST APIs
```

---

# ⭐ Support

If you found this project useful:

**⭐ Star the repository**

**🍴 Fork it**

**💡 Build on it**

**🐛 Open an issue**

---

## 🚀 DocuScan

### PDF → OCR → AI → Entities → JSON

**From unstructured documents to structured intelligence.**
