import dotenv from "dotenv";
dotenv.config();
const key = process.env.GOOGLE_AI_API_KEY;
console.log("Key (last 4):", key ? key.slice(-4) : "missing");

const res = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + key,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Say hello in one word." }] }],
      generationConfig: { maxOutputTokens: 10 },
    }),
  }
);

const data = await res.json();
if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
  console.log("SUCCESS. AI said:", data.candidates[0].content.parts[0].text);
} else {
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(data).slice(0, 500));
}
