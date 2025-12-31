/**
 * Simple, reliable PDF text extraction
 * Focuses on getting text from common PDF formats
 */

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  console.log(`Starting simple PDF extraction for ${pdfBuffer.length} bytes`);

  // Method 1: Basic pdf-parse (most reliable for standard PDFs)
  try {
    const pdfParse = require("pdf-parse");
    console.log("Trying basic pdf-parse...");

    const data = await pdfParse(pdfBuffer, {
      max: 0, // Extract all pages
      version: "v1.10.100", // Use specific version for stability
    });

    if (data.text && data.text.trim().length > 0) {
      const cleanText = data.text.replace(/\s+/g, " ").trim();

      if (cleanText.length >= 10) {
        // Lower threshold for testing
        console.log(`✅ pdf-parse SUCCESS: ${cleanText.length} characters`);
        return cleanText;
      }
    }
    console.log("pdf-parse: insufficient text content");
  } catch (error) {
    console.log(
      "pdf-parse failed:",
      error instanceof Error ? error.message : String(error)
    );
  }

  // Method 2: pdf2json (different parsing approach)
  try {
    console.log("Trying pdf2json...");
    const PDFParser = require("pdf2json");

    const extractedText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        reject(new Error(`pdf2json error: ${errData.parserError}`));
      });

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          let text = "";

          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
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
            }
          }

          resolve(text.trim());
        } catch (parseError) {
          reject(parseError);
        }
      });

      // Set timeout to prevent hanging
      setTimeout(() => {
        reject(new Error("pdf2json timeout"));
      }, 10000);

      pdfParser.parseBuffer(pdfBuffer);
    });

    if (extractedText && extractedText.length >= 10) {
      const cleanText = extractedText.replace(/\s+/g, " ").trim();
      console.log(`✅ pdf2json SUCCESS: ${cleanText.length} characters`);
      return cleanText;
    }
    console.log("pdf2json: insufficient text content");
  } catch (error) {
    console.log(
      "pdf2json failed:",
      error instanceof Error ? error.message : String(error)
    );
  }

  // Method 3: Direct text extraction from PDF streams
  try {
    console.log("Trying direct stream extraction...");
    const pdfString = pdfBuffer.toString("latin1");
    let extractedText = "";

    // Look for text in PDF streams
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let streamMatch;

    while ((streamMatch = streamRegex.exec(pdfString)) !== null) {
      const streamContent = streamMatch[1];

      // Look for text operators
      const textRegex = /\(([^)]*)\)\s*Tj/g;
      let textMatch;

      while ((textMatch = textRegex.exec(streamContent)) !== null) {
        if (textMatch[1]) {
          extractedText += textMatch[1] + " ";
        }
      }

      // Look for TJ arrays
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      let tjMatch;

      while ((tjMatch = tjArrayRegex.exec(streamContent)) !== null) {
        const arrayContent = tjMatch[1];
        const stringMatches = arrayContent.match(/\(([^)]*)\)/g);
        if (stringMatches) {
          for (const str of stringMatches) {
            const text = str.slice(1, -1); // Remove parentheses
            if (text) {
              extractedText += text + " ";
            }
          }
        }
      }
    }

    if (extractedText.trim().length >= 10) {
      const cleanText = extractedText
        .replace(/\s+/g, " ")
        .replace(/[^\x20-\x7E\s]/g, "") // Keep only printable ASCII
        .trim();

      if (cleanText.length >= 10) {
        console.log(
          `✅ Direct extraction SUCCESS: ${cleanText.length} characters`
        );
        return cleanText;
      }
    }
    console.log("Direct extraction: insufficient text content");
  } catch (error) {
    console.log(
      "Direct extraction failed:",
      error instanceof Error ? error.message : String(error)
    );
  }

  // Method 4: Try pdfjs-dist (Mozilla's library) - Skip in server environment
  if (typeof window !== "undefined") {
    try {
      console.log("Trying pdfjs-dist...");
      const pdfjsLib = require("pdfjs-dist");

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useSystemFonts: true,
        disableFontFace: false,
      });

      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();

          const pageText = textContent.items
            .map((item: any) => {
              if (typeof item.str === "string") {
                return item.str;
              }
              return "";
            })
            .join(" ");

          fullText += pageText + " ";
        } catch (pageError) {
          console.log(`Error processing page ${pageNum}:`, pageError);
          continue;
        }
      }

      if (fullText.trim().length >= 10) {
        const cleanText = fullText.replace(/\s+/g, " ").trim();
        console.log(`✅ pdfjs-dist SUCCESS: ${cleanText.length} characters`);
        return cleanText;
      }
      console.log("pdfjs-dist: insufficient text content");
    } catch (error) {
      console.log(
        "pdfjs-dist failed:",
        error instanceof Error ? error.message : String(error)
      );
    }
  } else {
    console.log("Skipping pdfjs-dist in server environment");
  }

  // All methods failed - provide detailed error
  console.error("❌ ALL PDF EXTRACTION METHODS FAILED");

  // Analyze the PDF to provide better error messages
  const pdfString = pdfBuffer.toString("latin1");
  const hasValidHeader = pdfBuffer.subarray(0, 4).toString() === "%PDF";
  const hasEOF = pdfString.includes("%%EOF");
  const hasStreams = pdfString.includes("stream");
  const hasTextOperators = pdfString.includes("Tj") || pdfString.includes("TJ");
  const hasImages =
    pdfString.includes("/Image") || pdfString.includes("/XObject");

  console.log("PDF Analysis:", {
    hasValidHeader,
    hasEOF,
    hasStreams,
    hasTextOperators,
    hasImages,
    bufferSize: pdfBuffer.length,
  });

  if (!hasValidHeader) {
    throw new Error("This file is not a valid PDF. Please upload a PDF file.");
  }

  if (hasImages && !hasTextOperators) {
    throw new Error(
      "This PDF contains only images (scanned document). " +
        "Please create a text-based resume:\n\n" +
        "1. Open Microsoft Word or Google Docs\n" +
        "2. Type or paste your resume content\n" +
        "3. Save/Export as PDF\n" +
        "4. Make sure you can select text in the PDF"
    );
  }

  if (!hasStreams) {
    throw new Error(
      "This PDF has an unusual format that we cannot process. " +
        "Please try creating a new PDF from Microsoft Word or Google Docs."
    );
  }

  throw new Error(
    "We couldn't extract text from your PDF. Please try:\n\n" +
      "✅ Create a new PDF from Word:\n" +
      "   • File → Save As → PDF\n" +
      "   • Don't use 'Optimize for web'\n\n" +
      "✅ Test your PDF:\n" +
      "   • Open it and try to select text\n" +
      "   • If you can't select text, recreate it\n\n" +
      "✅ Alternative: Upload as DOCX file instead"
  );
}
