import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
if (typeof window === "undefined") {
  // Server-side configuration
  pdfjsLib.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.min.js");
}

export interface ParseResult {
  text: string;
  method: string;
  pages: number;
  wordCount: number;
  success: boolean;
  error?: string;
}

/**
 * Method 1: Using pdf-parse (original method)
 */
async function parseWithPdfParse(buffer: Buffer): Promise<ParseResult> {
  try {
    const pdfParse = require("pdf-parse");
    const options = {
      normalizeWhitespace: false,
      disableCombineTextItems: false,
      max: 0, // Extract all pages
    };

    const data = await pdfParse(buffer, options);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No text content found");
    }

    const cleanText = data.text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    return {
      text: cleanText,
      method: "pdf-parse",
      pages: data.numpages || 1,
      wordCount: cleanText.split(/\s+/).length,
      success: true,
    };
  } catch (error) {
    return {
      text: "",
      method: "pdf-parse",
      pages: 0,
      wordCount: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 2: Using PDF.js (Mozilla's PDF library)
 */
async function parseWithPdfJs(buffer: Buffer): Promise<ParseResult> {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      disableFontFace: false,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText = "";

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item: any) => {
          if ("str" in item) {
            return item.str;
          }
          return "";
        })
        .join(" ");

      fullText += pageText + "\n";
    }

    if (!fullText || fullText.trim().length === 0) {
      throw new Error("No text content extracted");
    }

    const cleanText = fullText
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    return {
      text: cleanText,
      method: "pdf.js",
      pages: numPages,
      wordCount: cleanText.split(/\s+/).length,
      success: true,
    };
  } catch (error) {
    return {
      text: "",
      method: "pdf.js",
      pages: 0,
      wordCount: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Method 3: Simple text extraction fallback
 */
async function parseWithSimpleExtraction(buffer: Buffer): Promise<ParseResult> {
  try {
    // Convert buffer to string and look for text patterns
    const bufferString = buffer.toString("binary");

    // Look for text between stream objects
    const textMatches = bufferString.match(/BT\s+.*?ET/g);
    let extractedText = "";

    if (textMatches) {
      for (const match of textMatches) {
        // Extract text from PDF text objects
        const textContent = match.match(/\((.*?)\)/g);
        if (textContent) {
          extractedText +=
            textContent
              .map((t) => t.slice(1, -1)) // Remove parentheses
              .join(" ") + " ";
        }
      }
    }

    // Also try to find text in a different pattern
    if (!extractedText) {
      const altMatches = bufferString.match(/\(([^)]+)\)/g);
      if (altMatches) {
        extractedText = altMatches
          .map((match) => match.slice(1, -1))
          .filter((text) => text.length > 2 && /[a-zA-Z]/.test(text))
          .join(" ");
      }
    }

    if (!extractedText || extractedText.trim().length < 10) {
      throw new Error("Insufficient text content found");
    }

    const cleanText = extractedText.replace(/\s+/g, " ").trim();

    return {
      text: cleanText,
      method: "simple-extraction",
      pages: 1,
      wordCount: cleanText.split(/\s+/).length,
      success: true,
    };
  } catch (error) {
    return {
      text: "",
      method: "simple-extraction",
      pages: 0,
      wordCount: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main PDF parsing function with multiple fallback methods
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const methods = [
    parseWithPdfJs, // Try PDF.js first (most reliable)
    parseWithPdfParse, // Then pdf-parse
    parseWithSimpleExtraction, // Finally, simple extraction
  ];

  const results: ParseResult[] = [];

  for (const method of methods) {
    try {
      const result = await method(buffer);
      results.push(result);

      if (result.success && result.text.length > 50 && result.wordCount > 10) {
        console.log(`PDF parsing successful with ${result.method}:`, {
          textLength: result.text.length,
          wordCount: result.wordCount,
          pages: result.pages,
        });
        return result.text;
      }
    } catch (error) {
      console.error(`Method ${method.name} failed:`, error);
      results.push({
        text: "",
        method: method.name,
        pages: 0,
        wordCount: 0,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // If all methods failed, provide detailed error information
  const errorDetails = results
    .filter((r) => !r.success)
    .map((r) => `${r.method}: ${r.error}`)
    .join("; ");

  // Check if any method extracted some text (even if minimal)
  const bestResult = results
    .filter((r) => r.success && r.text.length > 0)
    .sort((a, b) => b.wordCount - a.wordCount)[0];

  if (bestResult) {
    console.log(
      `Using best available result from ${bestResult.method} with ${bestResult.wordCount} words`
    );
    return bestResult.text;
  }

  throw new Error(
    `Failed to extract text from PDF using all available methods. ` +
      `This PDF might be image-based, corrupted, or use an unsupported format. ` +
      `Details: ${errorDetails}`
  );
}

/**
 * Validate PDF buffer
 */
export function validatePDFBuffer(buffer: Buffer): {
  valid: boolean;
  error?: string;
} {
  try {
    // Check PDF header
    const header = buffer.subarray(0, 8).toString();
    if (!header.startsWith("%PDF-")) {
      return {
        valid: false,
        error: "Invalid PDF header - file may be corrupted",
      };
    }

    // Check minimum size
    if (buffer.length < 1024) {
      return {
        valid: false,
        error: "PDF file is too small - may be corrupted",
      };
    }

    // Check for PDF trailer
    const trailer = buffer.subarray(-1024).toString();
    if (!trailer.includes("%%EOF") && !trailer.includes("endobj")) {
      return { valid: false, error: "PDF file appears to be incomplete" };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `PDF validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Get detailed PDF information for debugging
 */
export async function getPDFInfo(buffer: Buffer): Promise<{
  isValid: boolean;
  size: number;
  header: string;
  hasTrailer: boolean;
  estimatedPages: number;
  error?: string;
}> {
  try {
    const validation = validatePDFBuffer(buffer);
    const header = buffer.subarray(0, 20).toString();
    const content = buffer.toString("binary");
    const hasTrailer = content.includes("%%EOF");

    // Estimate pages by counting page objects
    const pageMatches = content.match(/\/Type\s*\/Page[^s]/g);
    const estimatedPages = pageMatches ? pageMatches.length : 1;

    return {
      isValid: validation.valid,
      size: buffer.length,
      header: header.replace(/[^\x20-\x7E]/g, ""), // Remove non-printable chars
      hasTrailer,
      estimatedPages,
      error: validation.error,
    };
  } catch (error) {
    return {
      isValid: false,
      size: buffer.length,
      header: "",
      hasTrailer: false,
      estimatedPages: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
