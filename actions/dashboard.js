"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

/** Helper: extract JSON-like substring from model text */
function extractJsonStringFromText(text) {
  if (!text || typeof text !== "string") return null;

  // 1) triple-backtick fenced JSON (``` or ```json)
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const fenceMatch = text.match(fenceRegex);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();

  // 2) single backtick `...`
  const singleBacktickRegex = /`([^`{[][\s\S]*?)`/;
  const singleMatch = text.match(singleBacktickRegex);
  if (singleMatch && singleMatch[1]) return singleMatch[1].trim();

  // 3) fallback: first {...} or [...]
  const firstObj = text.indexOf("{");
  const lastObj = text.lastIndexOf("}");
  if (firstObj !== -1 && lastObj !== -1 && lastObj > firstObj) {
    return text.slice(firstObj, lastObj + 1).trim();
  }

  const firstArr = text.indexOf("[");
  const lastArr = text.lastIndexOf("]");
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) {
    return text.slice(firstArr, lastArr + 1).trim();
  }

  return null;
}

export const generateAIInsights = async (industry) => {
  const prompt = `
Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
{
  "salaryRanges": [
    { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
  ],
  "growthRate": number,
  "demandLevel": "High" | "Medium" | "Low",
  "topSkills": ["skill1", "skill2"],
  "marketOutlook": "Positive" | "Neutral" | "Negative",
  "keyTrends": ["trend1", "trend2"],
  "recommendedSkills": ["skill1", "skill2"]
}

IMPORTANT: Return ONLY the raw JSON object. DO NOT wrap it in markdown or triple backticks, DO NOT add any explanatory text, and DO NOT use single quotes. Return valid JSON. Include at least 5 roles and 5 skills/trends where applicable.
  `.trim();

  const contents = [
    {
      role: "user",
      // some SDK variants need `parts` or `content` — this shape is common and iterable
      parts: [{ text: prompt }],
    },
  ];

  // safe call: ensure we pass an iterable shape to the SDK
  let result;
  try {
    result = await model.generateContent({ contents });
  } catch (err) {
    console.error("Generative AI request failed:", err);
    throw new Error("Failed to generate AI insights");
  }

  // Response handling (SDKs may return different shapes; this is defensive)
  const response = result?.response ?? result;
  let rawText = "";
  try {
    // if response has a text() helper (stream-like)
    if (typeof response?.text === "function") {
      rawText = await response.text();
    } else if (typeof response === "string") {
      rawText = response;
    } else if (result?.output && Array.isArray(result.output)) {
      // fallback: some SDKs return array of content parts
      rawText = result.output.map((o) => (o?.content ?? o?.text ?? "")).join("\n");
    } else {
      rawText = JSON.stringify(response);
    }
  } catch (err) {
    console.error("Failed to read model response:", err, { result });
    throw new Error("Failed to read model response");
  }

  const jsonString = extractJsonStringFromText(rawText);
  if (!jsonString) {
    console.error("AI output did not contain JSON. Raw output:\n", rawText);
    throw new Error("AI returned no JSON. Check logs for raw output.");
  }

  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (err) {
    console.error("Failed to parse JSON. Cleaned text:\n", jsonString);
    console.error("Original AI output:\n", rawText);
    throw new Error("AI returned malformed JSON. See server logs for the cleaned output.");
  }
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  function normalizeInsights(i) {
    return {
      ...i,
      demandLevel: i.demandLevel?.toUpperCase(),
      marketOutlook: i.marketOutlook?.toUpperCase(),
    };
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      industryInsight: true,
    }
  });

  if (!user) throw new Error("User not found");

  if (!user.industryInsight) {
    const insights = await generateAIInsights(user.industry);
    const normalizedInsights = normalizeInsights(insights);

    const industryInsight = await db.industryInsight.create({
      data: {
        industry: user.industry,
        ...normalizedInsights,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return industryInsight;
  }

  return user.industryInsight;
}

