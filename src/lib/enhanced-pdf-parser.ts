/**
 * Enhanced PDF Parser - CLEAN VERSION - NO PROBLEMATIC LIBRARIES
 * Only includes working, tested methods
 */

export interface PDFParsingResult {
  text: string;
  method: string;
  confidence: number;
  metadata?: {
    pages?: number;
    wordCount?: number;
    hasImages?: boolean;
    isScanned?: boolean;
    fileSize?: number;
  };
}

export async function extractTextFromPDFEnhanced(
  pdfBuffer: Buffer
): Promise<PDFParsingResult> {
  console.log(
    `🚀 Enhanced PDF extraction starting for ${pdfBuffer.length} bytes`
  );

  // ONLY WORKING METHODS - NO TEXTRACT OR NODE-TIKA
  const methods = [
    { name: "pdf-parse-optimized", fn: tryPdfParseOptimized },
    { name: "pdf-lib-advanced", fn: tryPdfLibAdvanced },
    { name: "pdf-extraction", fn: tryPdfExtraction },
    { name: "pdf2json-enhanced", fn: tryPdf2JsonEnhanced },
    { name: "mammoth-fallback", fn: tryMammothFallback },
    { name: "direct-stream-advanced", fn: tryDirectStreamAdvanced },
  ];

  for (const method of methods) {
    try {
      console.log(`🔍 Trying method: ${method.name}`);
      const result = await method.fn(pdfBuffer);

      if (result && result.text && result.text.trim().length >= 10) {
        console.log(
          `✅ ${method.name} SUCCESS: ${result.text.length} characters`
        );
        return {
          ...result,
          method: method.name,
          confidence: calculateConfidence(result.text, method.name),
        };
      }

      console.log(`⚠️ ${method.name}: insufficient content`);
    } catch (error) {
      console.log(
        `❌ ${method.name} failed:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // All methods failed
  return handleExtractionFailure(pdfBuffer);
}

// Method 1: pdf-parse with multiple configurations
async function tryPdfParseOptimized(
  pdfBuffer: Buffer
): Promise<PDFParsingResult> {
  const pdfParse = require("pdf-parse");

  const configs = [
    { max: 0, version: "v1.10.100" },
    { max: 0, normalizeWhitespace: false },
    { max: 10, version: "v1.10.100" },
    { max: 0, pagerender: null },
  ];

  for (const config of configs) {
    try {
      const data = await pdfParse(pdfBuffer, config);
      if (data.text && data.text.trim().length > 0) {
        return {
          text: cleanText(data.text),
          method: "pdf-parse-optimized",
          confidence: 0.9,
          metadata: {
            pages: data.numpages,
            wordCount: data.text.split(/\s+/).length,
            fileSize: pdfBuffer.length,
          },
        };
      }
    } catch (error) {
      continue;
    }
  }

  throw new Error("All pdf-parse configurations failed");
}
// Method 2: pdf-lib advanced
async function tryPdfLibAdvanced(pdfBuffer: Buffer): Promise<PDFParsingResult> {
  const { PDFDocument } = require("pdf-lib");

  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  let fullText = "";

  for (let i = 0; i < Math.min(pages.length, 20); i++) {
    try {
      const page = pages[i];
      const textContent = await extractPageText(page);
      if (textContent) {
        fullText += textContent + "\n";
      }
    } catch (pageError) {
      continue;
    }
  }

  if (fullText.trim().length === 0) {
    throw new Error("No text content found");
  }

  return {
    text: cleanText(fullText),
    method: "pdf-lib-advanced",
    confidence: 0.85,
    metadata: {
      pages: pages.length,
      wordCount: fullText.split(/\s+/).length,
      fileSize: pdfBuffer.length,
    },
  };
}

// Method 3: pdf-extraction
async function tryPdfExtraction(pdfBuffer: Buffer): Promise<PDFParsingResult> {
  const pdfExtract = require("pdf-extraction");

  const data = await pdfExtract(pdfBuffer, {
    firstPage: 1,
    lastPage: 20,
    password: "",
    splitPages: false,
    normalizeWhitespace: true,
  });

  if (!data.text || data.text.trim().length === 0) {
    throw new Error("No text extracted");
  }

  return {
    text: cleanText(data.text),
    method: "pdf-extraction",
    confidence: 0.8,
    metadata: {
      pages: data.pages?.length || 0,
      wordCount: data.text.split(/\s+/).length,
      hasImages: data.pages?.some((p: any) => p.images?.length > 0),
      fileSize: pdfBuffer.length,
    },
  };
}

// Method 4: pdf2json enhanced
async function tryPdf2JsonEnhanced(
  pdfBuffer: Buffer
): Promise<PDFParsingResult> {
  const PDFParser = require("pdf2json");

  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    let hasResolved = false;

    const timeout = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        reject(new Error("pdf2json timeout (15s)"));
      }
    }, 15000);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeout);
        reject(new Error(`pdf2json error: ${errData.parserError}`));
      }
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      if (hasResolved) return;
      hasResolved = true;
      clearTimeout(timeout);

      try {
        let text = "";
        let pageCount = 0;

        if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
          pageCount = pdfData.Pages.length;

          for (const page of pdfData.Pages) {
            if (page.Texts && Array.isArray(page.Texts)) {
              for (const textItem of page.Texts) {
                if (textItem.R && Array.isArray(textItem.R)) {
                  for (const run of textItem.R) {
                    if (run.T) {
                      try {
                        text += decodeURIComponent(run.T) + " ";
                      } catch (e) {
                        text += run.T + " ";
                      }
                    }
                  }
                }
              }
            }
            text += "\n";
          }
        }

        if (text.trim().length === 0) {
          reject(new Error("No text content found"));
          return;
        }

        resolve({
          text: cleanText(text),
          method: "pdf2json-enhanced",
          confidence: 0.7,
          metadata: {
            pages: pageCount,
            wordCount: text.split(/\s+/).length,
            fileSize: pdfBuffer.length,
          },
        });
      } catch (parseError) {
        reject(parseError);
      }
    });

    try {
      pdfParser.parseBuffer(pdfBuffer);
    } catch (error) {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeout);
        reject(error);
      }
    }
  });
}
// Method 5: mammoth fallback
async function tryMammothFallback(
  pdfBuffer: Buffer
): Promise<PDFParsingResult> {
  const mammoth = require("mammoth");

  try {
    const result = await mammoth.extractRawText({ buffer: pdfBuffer });

    if (result.value && result.value.trim().length > 0) {
      return {
        text: cleanText(result.value),
        method: "mammoth-fallback",
        confidence: 0.6,
        metadata: {
          wordCount: result.value.split(/\s+/).length,
          fileSize: pdfBuffer.length,
        },
      };
    }
  } catch (error) {
    // Expected to fail for true PDFs
  }

  throw new Error("Mammoth fallback failed");
}

// Method 6: Direct stream extraction - THE ONE THAT WORKS!
async function tryDirectStreamAdvanced(
  pdfBuffer: Buffer
): Promise<PDFParsingResult> {
  const pdfString = pdfBuffer.toString("latin1");
  let extractedText = "";

  // Multiple text extraction patterns
  const patterns = [
    /\(([^)]*)\)\s*Tj/g,
    /\[(.*?)\]\s*TJ/g,
    /BT\s*(.*?)\s*ET/gs,
    /\d+\s+\d+\s+Td\s*\(([^)]*)\)/g,
    /\(([^)]*)\)\s*'/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(pdfString)) !== null) {
      if (match[1]) {
        extractedText += match[1] + " ";
      }
    }
  }

  // Clean and validate
  extractedText = extractedText
    .replace(/[^\x20-\x7E\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (extractedText.length === 0) {
    throw new Error("No text found in streams");
  }

  return {
    text: extractedText,
    method: "direct-stream-advanced",
    confidence: 0.5,
    metadata: {
      wordCount: extractedText.split(/\s+/).length,
      fileSize: pdfBuffer.length,
    },
  };
}

// Helper functions
async function extractPageText(page: any): Promise<string> {
  try {
    const content = page.getContentStream();
    if (content) {
      const contentString = content.toString();
      const textMatches = contentString.match(/\(([^)]*)\)\s*Tj/g);
      if (textMatches) {
        return textMatches
          .map((match) => match.replace(/[()]/g, "").replace(/\s*Tj/, ""))
          .join(" ");
      }
    }
  } catch (error) {
    // Fallback
  }

  return "";
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .replace(/[^\x20-\x7E\n\r\t]/g, "")
    .trim();
}

function calculateConfidence(text: string, method: string): number {
  const baseConfidence =
    {
      "pdf-parse-optimized": 0.9,
      "pdf-lib-advanced": 0.85,
      "pdf-extraction": 0.8,
      "pdf2json-enhanced": 0.7,
      "mammoth-fallback": 0.6,
      "direct-stream-advanced": 0.5,
    }[method] || 0.5;

  const wordCount = text.split(/\s+/).length;
  const hasProperWords = /\b[a-zA-Z]{3,}\b/.test(text);
  const hasNumbers = /\d/.test(text);
  const hasStructure = /[.!?]/.test(text);

  let qualityBonus = 0;
  if (wordCount > 50) qualityBonus += 0.1;
  if (hasProperWords) qualityBonus += 0.05;
  if (hasNumbers) qualityBonus += 0.02;
  if (hasStructure) qualityBonus += 0.03;

  return Math.min(1.0, baseConfidence + qualityBonus);
}

function handleExtractionFailure(pdfBuffer: Buffer): PDFParsingResult {
  console.error("❌ ALL PDF EXTRACTION METHODS FAILED");

  const pdfString = pdfBuffer.toString("latin1");
  const analysis = {
    hasValidHeader: pdfBuffer.subarray(0, 4).toString() === "%PDF",
    hasEOF: pdfString.includes("%%EOF"),
    hasStreams: pdfString.includes("stream"),
    hasTextOperators: pdfString.includes("Tj") || pdfString.includes("TJ"),
    hasImages: pdfString.includes("/Image") || pdfString.includes("/XObject"),
    hasEncryption: pdfString.includes("/Encrypt"),
    bufferSize: pdfBuffer.length,
  };

  console.log("PDF Analysis:", analysis);

  let errorMessage = "Unable to extract text from this PDF. ";

  if (!analysis.hasValidHeader) {
    errorMessage = "This file is not a valid PDF. Please upload a PDF file.";
  } else if (analysis.hasEncryption) {
    errorMessage =
      "This PDF is password protected. Please provide an unprotected version.";
  } else if (analysis.hasImages && !analysis.hasTextOperators) {
    errorMessage = `This PDF contains only images (scanned document).

Please create a text-based resume:
1. Open Microsoft Word or Google Docs
2. Type or paste your resume content
3. Save/Export as PDF
4. Make sure you can select text in the PDF`;
  } else {
    errorMessage = `We couldn't extract text from your PDF. Please try:

✅ Create a new PDF from Word:
   • File → Save As → PDF
   • Don't use 'Optimize for web'

✅ Test your PDF:
   • Open it and try to select text
   • If you can't select text, recreate it

✅ Alternative formats:
   • Upload as DOCX file instead
   • Use 'Print to PDF' from your browser`;
  }

  throw new Error(errorMessage);
}
