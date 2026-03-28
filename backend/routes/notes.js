const router = require("express").Router();
const Note = require("../models/Note");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const note = await Note.create({
      userId: req.user.id,
      title,
      content,
    });

    return res.status(201).json(note);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create note" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(notes);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch notes" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title, content },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.json(note);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update note" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.json({ message: "Note deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete note" });
  }
});

module.exports = router;