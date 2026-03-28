const router = require("express").Router();
const auth = require("../middleware/auth");

router.post("/summarize", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    let cleaned = text
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\bi am\b/gi, "I am")
      .replace(/\bmern\b/gi, "MERN")
      .replace(/\bfull stack\b/gi, "full-stack");

    const fillerWords = [
      "very",
      "really",
      "just",
      "basically",
      "actually",
      "kind of",
      "sort of",
      "i think",
      "i feel",
    ];

    fillerWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      cleaned = cleaned.replace(regex, "");
    });

    const sentences = cleaned
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const priorityWords = [
      "developer",
      "engineer",
      "experience",
      "skills",
      "project",
      "learning",
      "job",
      "career",
      "growth",
    ];

    const scored = sentences.map((sentence) => {
      let score = 0;
      const lower = sentence.toLowerCase();

      priorityWords.forEach((word) => {
        if (lower.includes(word)) score += 2;
      });

      if (sentence.length > 40 && sentence.length < 150) score += 1;

      return { sentence, score };
    });

    scored.sort((a, b) => b.score - a.score);

    let summary = "";
    if (scored.length >= 2) {
      summary = scored.slice(0, 2).map((s) => s.sentence).join(" ");
    } else if (scored.length === 1) {
      summary = scored[0].sentence;
    } else {
      summary = cleaned.slice(0, 100) + "...";
    }

    summary = summary
      .replace(/\s+/g, " ")
      .replace(/\bi\b/g, "I")
      .trim();

    summary = summary.charAt(0).toUpperCase() + summary.slice(1);

    return res.json({ summary });
  } catch (error) {
    return res.status(500).json({ message: "AI summarization failed" });
  }
});

module.exports = router;