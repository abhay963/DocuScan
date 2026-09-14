import { PDFParse } from "pdf-parse";
import Tesseract from "tesseract.js";
import Groq from "groq-sdk";

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const CHUNK_SIZE = 4500;

// Delay between Groq requests because of TPM limits
const GROQ_DELAY_MS = 5000;

// Maximum output tokens from Groq
const MAX_COMPLETION_TOKENS = 2500;

// If PDF text is below this, use OCR
const MIN_TEXT_LENGTH = 50;


/*
|--------------------------------------------------------------------------
| UTILITY
|--------------------------------------------------------------------------
*/

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


/*
|--------------------------------------------------------------------------
| GROQ CLIENT
|--------------------------------------------------------------------------
*/

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GROQ_API_KEY is missing in .env"
        );
    }

    return new Groq({
        apiKey
    });
}


/*
|--------------------------------------------------------------------------
| PDF TEXT EXTRACTION
|--------------------------------------------------------------------------
*/

async function extractPDFText(pdfBuffer) {
    console.log(
        "Trying normal PDF text extraction..."
    );

    const parser = new PDFParse({
        data: pdfBuffer
    });

    try {
        const result = await parser.getText();

        const text = result.text || "";

        console.log(
            `PDF pages: ${result.total}`
        );

        console.log(
            `PDF text length: ${text.length}`
        );

        return {
            text,
            pageCount: result.total || 0
        };
    } finally {
        await parser.destroy();
    }
}


/*
|--------------------------------------------------------------------------
| PDF TO IMAGES
|--------------------------------------------------------------------------
*/

async function convertPDFToImages(pdfBuffer) {
    console.log(
        "Converting PDF pages to images..."
    );

    const parser = new PDFParse({
        data: pdfBuffer
    });

    try {
        const result =
            await parser.getScreenshot({
                scale: 1.5
            });

        return result.pages.map(
            (page) => page.data
        );
    } finally {
        await parser.destroy();
    }
}


/*
|--------------------------------------------------------------------------
| OCR ONE PAGE
|--------------------------------------------------------------------------
*/

async function performOCR(
    imageBuffer,
    pageNumber
) {
    console.log(
        `OCR processing page ${pageNumber}...`
    );

    const result =
        await Tesseract.recognize(
            imageBuffer,
            "eng",
            {
                logger: (message) => {
                    if (
                        message.status ===
                        "recognizing text"
                    ) {
                        const progress =
                            Math.round(
                                (message.progress || 0) *
                                    100
                            );

                        console.log(
                            `Page ${pageNumber} OCR: ${progress}%`
                        );
                    }
                }
            }
        );

    return result.data.text || "";
}


/*
|--------------------------------------------------------------------------
| OCR COMPLETE PDF
|--------------------------------------------------------------------------
*/

async function extractTextUsingOCR(
    pdfBuffer
) {
    console.log(
        "Starting OCR fallback..."
    );

    const images =
        await convertPDFToImages(
            pdfBuffer
        );

    let completeText = "";

    for (
        let i = 0;
        i < images.length;
        i++
    ) {
        const pageNumber = i + 1;

        const pageText =
            await performOCR(
                images[i],
                pageNumber
            );

        completeText +=
            `\n--- PAGE ${pageNumber} ---\n`;

        completeText += pageText;

        completeText += "\n";
    }

    console.log(
        `OCR final text length: ${completeText.length}`
    );

    return {
        text: completeText,
        pageCount: images.length
    };
}


/*
|--------------------------------------------------------------------------
| CLEAN TEXT
|--------------------------------------------------------------------------
*/

function cleanText(text) {
    return text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}


/*
|--------------------------------------------------------------------------
| SPLIT LARGE DOCUMENT
|--------------------------------------------------------------------------
*/

function splitTextIntoChunks(text) {
    const chunks = [];

    let start = 0;

    while (start < text.length) {
        let end =
            start + CHUNK_SIZE;

        /*
         * Prefer breaking at newline.
         */
        if (end < text.length) {
            const newline =
                text.lastIndexOf(
                    "\n",
                    end
                );

            if (
                newline >
                start + 1500
            ) {
                end = newline;
            }
        }

        const chunk =
            text
                .slice(start, end)
                .trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        start = end;
    }

    console.log(
        `Document split into ${chunks.length} chunks`
    );

    return chunks;
}


/*
|--------------------------------------------------------------------------
| EXTRACT JSON FROM MODEL RESPONSE
|--------------------------------------------------------------------------
*/

function extractJSON(text) {
    if (!text) {
        throw new Error(
            "Empty model response"
        );
    }

    let cleaned = text.trim();

    /*
     * Remove markdown code fences.
     */

    cleaned = cleaned.replace(
        /^```json\s*/i,
        ""
    );

    cleaned = cleaned.replace(
        /^```\s*/i,
        ""
    );

    cleaned = cleaned.replace(
        /\s*```$/i,
        ""
    );

    cleaned = cleaned.trim();


    /*
     * Try direct JSON first.
     */

    try {
        return JSON.parse(cleaned);
    } catch {
        // Continue
    }


    /*
     * Try extracting JSON object
     * from surrounding text.
     */

    const firstBrace =
        cleaned.indexOf("{");

    const lastBrace =
        cleaned.lastIndexOf("}");


    if (
        firstBrace !== -1 &&
        lastBrace !== -1 &&
        lastBrace > firstBrace
    ) {
        const jsonText =
            cleaned.slice(
                firstBrace,
                lastBrace + 1
            );

        try {
            return JSON.parse(
                jsonText
            );
        } catch {
            // Continue
        }
    }


    throw new Error(
        "Model response did not contain valid JSON"
    );
}


/*
|--------------------------------------------------------------------------
| NORMALIZE ENTITY
|--------------------------------------------------------------------------
*/

function normalizeEntity(entity) {
    if (
        !entity ||
        typeof entity !== "object"
    ) {
        return null;
    }


    /*
     * Type validation
     */

    if (
        typeof entity.type !== "string" ||
        !entity.type.trim()
    ) {
        return null;
    }


    /*
     * Value validation
     */

    if (
        typeof entity.value !== "string" ||
        !entity.value.trim()
    ) {
        return null;
    }


    /*
     * Confidence
     */

    let confidence =
        Number(entity.confidence);


    if (
        Number.isNaN(confidence)
    ) {
        confidence = 0.8;
    }


    confidence =
        Math.max(
            0,
            Math.min(
                1,
                confidence
            )
        );


    /*
     * Page
     */

    let page = null;


    if (
        Number.isInteger(
            Number(entity.page)
        )
    ) {
        page =
            Number(entity.page);
    }


    return {
        type:
            entity.type
                .trim()
                .toUpperCase(),

        value:
            entity.value.trim(),

        confidence,

        page
    };
}


/*
|--------------------------------------------------------------------------
| GROQ - EXTRACT ONE CHUNK
|--------------------------------------------------------------------------
*/

async function extractEntitiesFromChunk(
    groq,
    chunk,
    chunkNumber,
    totalChunks
) {
    console.log(
        `\nProcessing Groq chunk ${chunkNumber}/${totalChunks}`
    );

    console.log(
        `Chunk text length: ${chunk.length}`
    );


    /*
     * Prompt
     */

    const prompt = `
You are an accurate document entity extraction engine.

Extract meaningful entities from the document text.

RULES:

1. Extract ONLY information explicitly present.
2. Never invent information.
3. Never guess missing information.
4. The document can be ANY type.
5. Do NOT assume the document is an invoice.
6. Determine entity types dynamically.
7. Preserve entity values accurately.
8. Avoid duplicate entities.
9. Confidence must be between 0 and 1.
10. Page must be an integer if clearly known.
11. Otherwise page must be null.
12. Return ONLY valid JSON.
13. Do NOT use markdown.
14. Do NOT explain anything.
15. Extract only meaningful entities.
16. Do not extract every repeated occurrence.
17. Return at most 30 entities from this chunk.
18. Keep each entity value concise and exact.

Possible entity types include:

PERSON
ORGANIZATION
LOCATION
ADDRESS
DATE
TIME
EMAIL
PHONE
URL
AMOUNT
CURRENCY
IDENTIFIER
INVOICE_NUMBER
PURCHASE_ORDER
ACCOUNT_NUMBER
JOB_TITLE
SKILL
PRODUCT
SERVICE
CONTRACT
REFERENCE_NUMBER

These are examples only.

You may create another semantic entity type when appropriate.

Return exactly this JSON structure:

{
  "entities": [
    {
      "type": "PERSON",
      "value": "John Smith",
      "confidence": 0.98,
      "page": null
    }
  ]
}

DOCUMENT:

${chunk}

END DOCUMENT.

Return ONLY JSON.
`;


    /*
     * Groq request
     *
     * IMPORTANT:
     * No response_format
     * No json_schema
     * No reasoning_format
     */

    const response =
        await groq.chat.completions.create({

            model:
                "openai/gpt-oss-120b",

            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],

            /*
             * GPT-OSS reasoning configuration
             */

            reasoning_effort: "low",

            /*
             * Do not return reasoning
             */

            include_reasoning: false,

            /*
             * Non-streaming response
             */

            stream: false,

            /*
             * Maximum output tokens
             */

            max_completion_tokens:
                MAX_COMPLETION_TOKENS,

            /*
             * Deterministic output
             */

            temperature: 0
        });


    /*
     * Get assistant message
     */

    const message =
        response
            .choices?.[0]
            ?.message;


    if (!message) {
        throw new Error(
            `Groq returned no message for chunk ${chunkNumber}`
        );
    }


    console.log(
        `Groq response received for chunk ${chunkNumber}`
    );


    /*
     * Get content
     */

    const content =
        message.content;


    /*
     * Handle empty response
     */

    if (
        !content ||
        !content.trim()
    ) {
        console.error(
            "\nEMPTY GROQ CONTENT"
        );

        console.error(
            "Complete Groq message:"
        );

        console.error(
            JSON.stringify(
                message,
                null,
                2
            )
        );

        throw new Error(
            `Empty Groq response for chunk ${chunkNumber}`
        );
    }


    console.log(
        `Groq response length: ${content.length}`
    );


    /*
     * Parse JSON
     */

    let parsed;

    try {
        parsed =
            extractJSON(content);
    } catch {
        console.error(
            "\nRAW GROQ RESPONSE:"
        );

        console.error(content);

        throw new Error(
            `Invalid JSON returned by Groq for chunk ${chunkNumber}`
        );
    }


    /*
     * Validate structure
     */

    if (
        !parsed ||
        !Array.isArray(
            parsed.entities
        )
    ) {
        console.error(
            "Invalid entities structure:"
        );

        console.error(
            JSON.stringify(
                parsed,
                null,
                2
            )
        );

        throw new Error(
            `Groq response does not contain entities array for chunk ${chunkNumber}`
        );
    }


    /*
     * Normalize entities
     */

    const entities =
        parsed.entities
            .map(
                normalizeEntity
            )
            .filter(Boolean);


    console.log(
        `Chunk ${chunkNumber} entities: ${entities.length}`
    );


    return entities;
}


/*
|--------------------------------------------------------------------------
| DEDUPLICATE ENTITIES
|--------------------------------------------------------------------------
*/

function deduplicateEntities(
    entities
) {
    const unique = [];

    const seen = new Set();


    for (
        const entity of entities
    ) {
        const key =
            `${entity.type.toLowerCase()}::${entity.value.toLowerCase()}`;


        if (
            seen.has(key)
        ) {
            continue;
        }


        seen.add(key);

        unique.push(entity);
    }


    return unique;
}


/*
|--------------------------------------------------------------------------
| EXTRACT ENTITIES FROM COMPLETE DOCUMENT
|--------------------------------------------------------------------------
*/

async function extractEntitiesWithGroq(
    text
) {
    console.log(
        "\nPreparing document for Groq..."
    );


    /*
     * Create Groq client
     */

    const groq =
        getGroqClient();


    /*
     * Split document
     */

    const chunks =
        splitTextIntoChunks(
            text
        );


    let allEntities = [];


    /*
     * Process chunks sequentially.
     *
     * Do NOT use Promise.all()
     * because that can hit rate limits.
     */

    for (
        let i = 0;
        i < chunks.length;
        i++
    ) {

        try {

            const entities =
                await extractEntitiesFromChunk(
                    groq,
                    chunks[i],
                    i + 1,
                    chunks.length
                );


            /*
             * Add entities
             */

            allEntities.push(
                ...entities
            );


            /*
             * Delay before next request
             */

            if (
                i <
                chunks.length - 1
            ) {

                console.log(
                    `Waiting ${
                        GROQ_DELAY_MS / 1000
                    } seconds...`
                );

                await sleep(
                    GROQ_DELAY_MS
                );
            }


        } catch (error) {

            console.error(
                `Groq chunk ${
                    i + 1
                } failed`
            );


            /*
             * Rate limit
             */

            if (
                error?.status === 429 ||
                error?.code ===
                    "rate_limit_exceeded"
            ) {
                throw new Error(
                    "Groq rate limit reached. Please wait and retry."
                );
            }


            throw error;
        }
    }


    /*
     * Before deduplication
     */

    console.log(
        `\nTotal entities before deduplication: ${
            allEntities.length
        }`
    );


    /*
     * Deduplicate
     */

    const uniqueEntities =
        deduplicateEntities(
            allEntities
        );


    console.log(
        `Total unique entities: ${
            uniqueEntities.length
        }`
    );


    return uniqueEntities;
}


/*
|--------------------------------------------------------------------------
| MAIN DOCUMENT PROCESSOR
|--------------------------------------------------------------------------
*/

export async function processDocument(
    pdfBuffer,
    fileName
) {
    console.log(
        `\nProcessing: ${fileName}`
    );


    /*
     * STEP 1
     * Normal PDF text extraction
     */

    let extracted =
        await extractPDFText(
            pdfBuffer
        );


    let text =
        extracted.text;


    let pageCount =
        extracted.pageCount;


    let source =
        "pdf-text";


    /*
     * STEP 2
     * OCR fallback
     */

    if (
        text.trim().length <
        MIN_TEXT_LENGTH
    ) {

        console.log(
            "Very little text detected."
        );

        console.log(
            "Falling back to OCR..."
        );


        extracted =
            await extractTextUsingOCR(
                pdfBuffer
            );


        text =
            extracted.text;


        pageCount =
            extracted.pageCount;


        source =
            "ocr";
    }


    /*
     * STEP 3
     * Clean extracted text
     */

    const cleanedText =
        cleanText(text);


    console.log(
        `Final text length: ${cleanedText.length}`
    );


    /*
     * Make sure text exists
     */

    if (
        cleanedText.length < 10
    ) {
        throw new Error(
            "Could not extract meaningful text from PDF"
        );
    }


    /*
     * STEP 4
     * Dynamic entity extraction
     */

    console.log(
        "\nStarting dynamic entity extraction..."
    );


    const entities =
        await extractEntitiesWithGroq(
            cleanedText
        );


    /*
     * STEP 5
     * Final result
     */

    return {
        text: cleanedText,

        pageCount,

        source,

        entities
    };
}