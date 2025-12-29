router.post("/by-ids", async (req, res) => {
  try {
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ message: "questionIds required" });
    }

    const questions = await Question.find({
      _id: { $in: questionIds }
    });

    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});
