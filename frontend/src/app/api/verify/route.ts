import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { image, taskDescription } = await request.json();

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Mock response for demo when no API key
      console.log("No OpenAI API key found, using mock verification");

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Random mock response for demo
      const isVerified = Math.random() > 0.3;
      return NextResponse.json({
        verified: isVerified,
        confidence: isVerified ? 85 : 30,
        reason: isVerified
          ? `Image appears to show evidence of completing: ${taskDescription}`
          : `Could not verify task completion: ${taskDescription}. Please upload a clearer image.`,
      });
    }

    // Real OpenAI Vision API call
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a task verification assistant. Analyze images to determine if they show evidence of completing a specific task. Be reasonably lenient but require clear evidence. Return JSON only.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this image. Does it show evidence of completing the task: "${taskDescription}"?

Return ONLY a JSON object in this exact format, no other text:
{"verified": true/false, "confidence": 0-100, "reason": "brief explanation"}`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        console.warn(`OpenAI API error ${response.status}, falling back to mock verification`);
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse the JSON response
      const result = JSON.parse(content);
      return NextResponse.json(result);
    } catch (apiError) {
      // Fall back to mock verification for demo
      console.log("Using mock verification due to API error");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const isVerified = Math.random() > 0.3;
      return NextResponse.json({
        verified: isVerified,
        confidence: isVerified ? 85 : 30,
        reason: isVerified
          ? `✓ Mock verification: Image appears to show evidence of completing: ${taskDescription}`
          : `✗ Mock verification: Could not verify task completion: ${taskDescription}. Please upload a clearer image.`,
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        verified: false,
        confidence: 0,
        reason: "Error processing image. Please try again.",
      },
      { status: 500 }
    );
  }
}
