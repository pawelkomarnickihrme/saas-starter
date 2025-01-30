import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { saveCVData } from "./utils";
import { cacheModelInFs } from "../../../utils/caching/cache-model-in-fs";

// Social media schema
const SocialMediaSchema = z.object({
  name: z.string().describe("Name of the social media platform"),
  url: z.string().url().describe("URL to the social media profile"),
  icon: z.any().describe("Icon component for the social media platform"),
});

// Contact schema
const ContactSchema = z.object({
  email: z.string().email().describe("Contact email address"),
  tel: z.string().describe("Contact phone number"),
  social: z.array(SocialMediaSchema).describe("List of social media profiles"),
});

// Education schema
const EducationSchema = z.object({
  school: z.string().describe("Name of the educational institution"),
  degree: z.string().describe("Degree obtained"),
  start: z.string().describe("Start year of education"),
  end: z
    .string()
    .nullable()
    .describe("End year of education (null if ongoing)"),
});

// Work experience schema
const WorkExperienceSchema = z.object({
  company: z.string().describe("Name of the company"),
  link: z.string().url().describe("URL to the company's website"),
  badges: z
    .array(z.string())
    .describe("Technologies or keywords related to the job"),
  title: z.string().describe("Job title or position held"),
  logo: z.any().describe("Logo component for the company"),
  start: z.string().describe("Start year of employment"),
  end: z
    .string()
    .nullable()
    .describe("End year of employment (null if ongoing)"),
  description: z
    .any()
    .describe("Detailed description of responsibilities and achievements"),
});

// Project schema
const ProjectSchema = z.object({
  title: z.string().describe("Title of the project"),
  techStack: z.array(z.string()).describe("Technologies used in the project"),
  description: z.string().describe("Brief description of the project"),
  logo: z.any().describe("Logo component for the project"),
  link: z
    .object({
      label: z.string().describe("Label for the project link"),
      href: z
        .string()
        .url()
        .describe("URL to the project website or repository"),
    })
    .nullable(),
});

// Main resume schema
export const ResumeSchema = z.object({
  name: z.string().describe("Full name of the individual"),
  initials: z.string().length(2).describe("Initials of the individual"),
  location: z.string().describe("Location of residence or work base"),
  locationLink: z
    .string()
    .url()
    .optional()
    .describe("Google Maps link for location (optional)"),
  about: z
    .string()
    .describe("Short description about the individual's professional focus"),
  summary: z
    .any()
    .describe("Detailed summary about expertise and professional focus"),
  avatarUrl: z
    .string()
    .url()
    .optional()
    .nullable()
    .describe(
      "URL to an avatar image (optional, can be null if no image is provided)"
    ),
  personalWebsiteUrl: z
    .string()
    .url()
    .optional()
    .nullable()
    .describe(
      "URL to personal website or portfolio (optional, can be null if not provided)"
    ),
  contact: ContactSchema.describe(
    "Contact information including email, phone, and social media"
  ),
  education: z
    .array(EducationSchema)
    .describe("List of educational qualifications"),
  work: z
    .array(WorkExperienceSchema)
    .describe("List of professional work experiences"),
  skills: z
    .array(z.string())
    .nonempty()
    .describe("List of technical skills and proficiencies"),
  projects: z
    .array(ProjectSchema)
    .nonempty()
    .describe("List of projects with details about technology and purpose"),
});

export type CVData = z.infer<typeof ResumeSchema>;

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
