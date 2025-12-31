import { NextRequest, NextResponse } from "next/server";
import {
  extractTextFromPDF,
  validatePDFBuffer,
  getPDFInfo,
} from "@/lib/pdf-parser";
import { parseDocument } from "@/lib/document-parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "No file provided",
          code: "NO_FILE",
        },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Only PDF, DOC, and DOCX files are supported",
          code: "INVALID_FILE_TYPE",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      let extractedText = "";
      let documentInfo: any = {};

      if (file.type === "application/pdf") {
        // PDF-specific processing
        const pdfInfo = await getPDFInfo(buffer);
        const validation = validatePDFBuffer(buffer);

        extractedText = await extractTextFromPDF(buffer);
        documentInfo = {
          type: "PDF",
          pdfInfo: {
            isValid: pdfInfo.isValid,
            estimatedPages: pdfInfo.estimatedPages,
            header: pdfInfo.header,
            hasTrailer: pdfInfo.hasTrailer,
          },
          validation: validation,
        };
      } else {
        // DOC/DOCX processing
        extractedText = await parseDocument(buffer, file.type);
        documentInfo = {
          type: file.type.includes("wordprocessingml") ? "DOCX" : "DOC",
          documentFormat: file.type,
        };
      }

      return NextResponse.json({
        success: true,
        fileName: file.name,
        fileSize: file.size,
        textLength: extractedText.length,
        preview: extractedText.substring(0, 500),
        wordCount: extractedText.split(/\s+/).length,
        hasContent: extractedText.length > 50,
        ...documentInfo,
      });
    } catch (extractionError) {
      const suggestions =
        file.type === "application/pdf"
          ? [
              "Ensure the PDF is text-based (not a scanned image)",
              "Try saving your resume as a new PDF from your word processor",
              "Check if the PDF opens correctly in a PDF viewer",
              "Make sure the PDF is not password protected",
              "Try using 'Print to PDF' instead of 'Save as PDF'",
              "Ensure the PDF contains selectable text (not just images)",
            ]
          : [
              "Ensure the document contains readable text",
              "Try saving as a newer format (DOCX instead of DOC)",
              "Check if the document opens correctly in Word",
              "Try converting to PDF for better compatibility",
              "Ensure the document is not corrupted",
            ];

      return NextResponse.json({
        success: false,
        fileName: file.name,
        fileSize: file.size,
        error:
          extractionError instanceof Error
            ? extractionError.message
            : "Unknown extraction error",
        suggestions: suggestions,
      });
    }
  } catch (error) {
    console.error("Test parse error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request: " + (error as Error).message,
        code: "PROCESSING_FAILED",
      },
      { status: 500 }
    );
  }
}
