import express from "express";
import { eq, and } from "drizzle-orm";
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

// delete route for deleting a favourite
app.delete("/api/favourites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    // Validation: check required params
    if (!userId || !recipeId) {
      return res.status(400).json({
        error: "Missing required parameters: userId and recipeId are required",
      });
    }

    // Delete favourite and check if it existed
    const deleted = await db
      .delete(favouritesTable)
      .where(
        and(
          eq(favouritesTable.userId, userId),
          eq(favouritesTable.recipeId, parseInt(recipeId))
        )
      )
      .returning();

    // Check if favourite was found and deleted
    if (deleted.length === 0) {
      return res.status(404).json({
        error: "Favourite not found",
      });
    }

    res.status(200).json({
      message: "Favourite deleted successfully",
      data: deleted[0],
    });
  } catch (error) {
    console.error("Error deleting favourite:", error);
    res.status(500).json({
      error: "Failed to delete favourite",
      details: error.message,
    });
  }
});

// get route for getting all favourites
app.get("/api/favourites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validation: check required param
    if (!userId) {
      return res.status(400).json({
        error: "Missing required parameter: userId is required",
      });
    }

    // Fetch all favourites for the user
    const favourites = await db
      .select()
      .from(favouritesTable)
      .where(eq(favouritesTable.userId, userId));

    res.status(200).json({
      message: "Favourites retrieved successfully",
      data: favourites,
      count: favourites.length,
    });
  } catch (error) {
    console.error("Error getting favourites:", error);
    res.status(500).json({
      error: "Failed to get favourites",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
