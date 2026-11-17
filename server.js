const express = require("express");
const path = require("path");
const pool = require("./db");
const invitationRoutes = require("./routes");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10kb" }));

// Only files in "public" are accessible through the browser.
app.use(express.static(path.join(__dirname, "public")));

// A simple check that the backend is running.
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Birthday website backend is running!"
    });
});

app.use("/api", invitationRoutes);

// Return readable errors without exposing database details.
app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({
            error: "The submitted data is not valid JSON."
        });
    }

    if (error.type === "entity.too.large") {
        return res.status(413).json({
            error: "The submitted data is too large."
        });
    }

    console.error("Request failed:", error.message);

    res.status(500).json({
        error: "Something went wrong. Please try again."
    });
});

async function startServer() {
    try {
        // Check the database connection and confirm the guests table exists.
        await pool.query("SELECT guest_id FROM public.guests LIMIT 1");

        console.log("Connected to the configured PostgreSQL database.");
        console.log("Guests table found.");

        const HOST = process.env.HOST || "127.0.0.1";

        app.listen(PORT, HOST, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Could not start the server:", error.message);
        await pool.end();
        process.exitCode = 1;
    }
}

startServer();