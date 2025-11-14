import express from "express";
import env from "./config/env.js";
import { db } from "./config/db.js";
import { favouritesTable } from "./db/schema.js";

const app = express();
const PORT = env.PORT;

// middleware for parsing JSON bodies
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", status: "success" });
});

// post route for adding a favourite
app.post("/api/favourites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    // Validation: check required fields
    if (!userId || !recipeId || !title) {
      return res.status(400).json({
        error:
          "Missing required fields: userId, recipeId, and title are required",
      });
    }

    // Insert favourite with all fields
    const [favourite] = await db
      .insert(favouritesTable)
      .values({
        userId,
        recipeId,
        title,
        image: image || null,
        cookTime: cookTime || null,
        servings: servings || null,
      })
      .returning();

    res.status(201).json({
      message: "Favourite added successfully",
      data: favourite,
    });
  } catch (error) {
    console.error("Error adding favourite:", error);
    res.status(500).json({
      error: "Failed to add favourite",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
