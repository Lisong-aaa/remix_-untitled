import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config({ path: ".env.local" });

const apiBaseUrl = (process.env.OPENAI_BASE_URL || "https://api.ltoken.shop/v1").replace(/\/$/, "");
const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gemini-3.5-flash";

async function generateJson(messages: unknown[]) {
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, response_format: { type: "json_object" } }),
  });
  if (!response.ok) throw new Error(`AI request failed (${response.status}): ${await response.text()}`);

  const completion = await response.json();
  const content = completion.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("AI response did not contain JSON content");
  return JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3001;

  app.use(express.json({ limit: "50mb" }));

  app.post("/api/analyze-food", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) return res.status(400).json({ error: "No image provided" });

      const result = await generateJson([
        { role: "system", content: "You are a nutrition expert. Return only a JSON object." },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image. Identify the food items present and estimate nutritional values per 100 grams. Return foodName and description in Simplified Chinese, with foodName, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, and description.",
            },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ]);
      res.json(result);
    } catch (error) {
      console.error("Error analyzing food:", error);
      res.status(500).json({ error: "Failed to analyze food" });
    }
  });

  app.post("/api/dietary-advice", async (req, res) => {
    try {
      const { profile, todayIntake } = req.body;
      const items = todayIntake.items || [];
      const exercises = todayIntake.exercises || [];
      const totalIntake = items.reduce(
        (acc: number, item: any) => acc + (item.caloriesPer100g || 0) * ((item.weightGrams || 100) / 100),
        0,
      );
      const totalBurned = exercises.reduce((acc: number, ex: any) => acc + (ex.caloriesBurned || 0), 0);
      const promptData = {
        dietIntakeItems: items,
        exercises,
        totalIntakeCalories: Math.round(totalIntake),
        totalBurnedCalories: Math.round(totalBurned),
        netCalories: Math.round(todayIntake.totalCalories || 0),
        macros: {
          protein: todayIntake.totalProtein,
          carbs: todayIntake.totalCarbs,
          fat: todayIntake.totalFat,
        },
      };
      const result = await generateJson([
        {
          role: "user",
          content: `You are an expert nutritionist. Review the user's profile, today's specific food intake, exercises, and history to provide comprehensive analysis.\n\nUser Profile (Target Calories: ${profile.targetCalories}):\n${JSON.stringify(profile)}\n\nToday's Data (Net Calories = Intake - Burned):\n${JSON.stringify(promptData, null, 2)}\n\nReturn only a JSON object in Simplified Chinese with weightImpact (impact on weight goals), advice (actionable next meal or tomorrow advice), and summary (one sentence including diet and exercise).`,
        },
      ]);
      res.json(result);
    } catch (error) {
      console.error("Error generating advice:", error);
      res.status(500).json({ error: "Failed to generate dietary advice" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}`));
}

startServer();
