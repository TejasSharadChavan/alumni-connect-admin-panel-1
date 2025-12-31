import mammoth from "mammoth";

export interface DocumentParseResult {
  text: string;
  format: string;
  wordCount: number;
  success: boolean;
  error?: string;
}

/**
 * Parse DOCX files using mammoth
 */
export async function parseDocxFile(
  buffer: Buffer
): Promise<DocumentParseResult> {
  try {
    console.log("Parsing DOCX file with mammoth...");
    const result = await mammoth.extractRawText({ buffer });

    console.log("Mammoth extraction result:", {
      hasValue: !!result.value,
      textLength: result.value?.length || 0,
      messages: result.messages?.length || 0,
    });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("No text content found in DOCX file");
    }

    const cleanText = result.value.replace(/\s+/g, " ").trim();

    if (cleanText.length < 20) {
      // Reduced minimum length
      throw new Error(
        `DOCX file contains insufficient text content (${cleanText.length} characters)`
      );
    }

    console.log(
      `Successfully extracted ${cleanText.length} characters from DOCX`
    );
    return {
      text: cleanText,
      format: "docx",
      wordCount: cleanText.split(/\s+/).length,
      success: true,
    };
  } catch (error) {
    console.error("DOCX parsing error:", error);
    return {
      text: "",
      format: "docx",
      wordCount: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Parse DOC files (basic support)
 */
export async function parseDocFile(
  buffer: Buffer
): Promise<DocumentParseResult> {
  try {
    // For DOC files, we'll try to extract text using basic methods
    // This is limited but better than nothing
    const text = buffer.toString("utf8");

    // Look for readable text patterns in DOC files
    const textMatches = text.match(/[\x20-\x7E\s]{10,}/g);

    if (!textMatches || textMatches.length === 0) {
      throw new Error("No readable text found in DOC file");
    }

    const extractedText = textMatches.join(" ").replace(/\s+/g, " ").trim();

    if (extractedText.length < 50) {
      throw new Error("DOC file contains insufficient readable text");
    }

    return {
      text: extractedText,
      format: "doc",
      wordCount: extractedText.split(/\s+/).length,
      success: true,
    };
  } catch (error) {
    return {
      text: "",
      format: "doc",
      wordCount: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Main document parsing function that handles multiple formats
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  let result: DocumentParseResult;

  switch (mimeType) {
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      result = await parseDocxFile(buffer);
      break;
    case "application/msword":
      result = await parseDocFile(buffer);
      break;
    default:
      throw new Error(`Unsupported document format: ${mimeType}`);
  }

  if (!result.success) {
    throw new Error(
      `Failed to parse ${result.format.toUpperCase()} file: ${result.error}. ` +
        `Please try converting your document to PDF format for better compatibility.`
    );
  }

  if (result.wordCount < 10) {
    throw new Error(
      `The ${result.format.toUpperCase()} file contains very little text (${result.wordCount} words). ` +
        `Please ensure your resume has sufficient content.`
    );
  }

  console.log(`Successfully parsed ${result.format.toUpperCase()} file:`, {
    textLength: result.text.length,
    wordCount: result.wordCount,
  });

  return result.text;
}
