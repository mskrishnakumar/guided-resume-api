import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Resume Builder API is running");
});

app.post("/generate-resume", async (req, res) => {
  try {
    const userData = req.body;

    const prompt = `
You are a career coach helping a first-time job seeker.

Create a simple, honest, one-page resume.

Rules:
- Use simple English
- Do not exaggerate experience
- Entry-level tone
- Clear sections
- Encourage confidence

User details:
${JSON.stringify(userData, null, 2)}
`;

    const response = await axios.post(
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-01`,
      {
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_KEY
        }
      }
    );

    const resume = response.data.choices[0].message.content;

    res.json({ resume });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate resume" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
