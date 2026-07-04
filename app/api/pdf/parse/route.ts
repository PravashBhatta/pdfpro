import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file was provided in the payload." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF binary data using pdf-parse library
    const { PDFParse } = require("pdf-parse");
    
    if (typeof PDFParse !== "function") {
      throw new Error(`PDFParse class not resolved. Check imports.`);
    }
    
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    
    // Clean up carriage returns/duplicate spacings if needed
    const cleanedText = data.text || "No text could be extracted from this PDF.";
    
    return NextResponse.json({
      text: cleanedText,
      pages: data.total || 1
    });
  } catch (error: any) {
    console.error("Failed to parse PDF document: ", error);
    return NextResponse.json({ 
      error: error?.message || "Internal server error parsing the PDF document." 
    }, { status: 500 });
  }
}
