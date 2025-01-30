import { type NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { saveCVData } from "./utils";
import { cacheModelInFs } from "../../../utils/caching/cache-model-in-fs";
import { ResumeSchema } from "./schema.zod";

// Social media schema

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const pdfModel = cacheModelInFs(anthropic("claude-3-5-sonnet-20241022"));
    const { object } = await generateObject({
      model: pdfModel,
      system:
        "You will receive a CV (Curriculum Vitae) in PDF format. Please extract the relevant information from the CV.",
      schema: ResumeSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: Buffer.from(buffer),
              mimeType: "application/pdf",
            },
          ],
        },
      ],
    });
    // saveCVData(object);
    //saveToDatabase(object);
    return NextResponse.json(object);
  } catch (error) {
    console.error("Error processing CV:", error);

    return NextResponse.json(
      { error: "Failed to process CV" },
      { status: 500 }
    );
  }
}
