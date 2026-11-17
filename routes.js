const express = require("express");
const crypto = require("crypto");
const pool = require("./db");

const router = express.Router();

// Do not cache private invitation responses.
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// Check the guest's invitation token before allowing access.
router.use(async (req, res, next) => {
  try {
    const authorization = req.get("Authorization") || "";
    const match = /^Bearer ([a-f0-9]{64})$/.exec(authorization);

    if (!match) {
      return res.status(401).json({
        error: "Please open your personal invitation link."
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(match[1])
      .digest("hex");

    const result = await pool.query(
      `SELECT guest_id, name, status,
              dietary_requirements, message
       FROM guests
       WHERE invite_token_hash = $1`,
      [tokenHash]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        error: "This invitation link is invalid or has been replaced."
      });
    }

    req.guest = result.rows[0];
    next();
  } catch (error) {
    next(error);
  }
});

// Return only the current guest's own information.
router.get("/invitation", (req, res) => {
  res.json({
    name: req.guest.name,
    status: req.guest.status,
    dietary_requirements: req.guest.dietary_requirements,
    message: req.guest.message
  });
});

// Save or change the current guest's RSVP.
router.post("/rsvp", async (req, res, next) => {
  try {
    const {
      status,
      dietary_requirements = "",
      message = ""
    } = req.body || {};

    if (!["attending", "unavailable"].includes(status)) {
      return res.status(400).json({
        error: "Please select whether you are attending."
      });
    }

    if (
      typeof dietary_requirements !== "string" ||
      dietary_requirements.length > 500
    ) {
      return res.status(400).json({
        error: "Dietary requirements must be text of 500 characters or fewer."
      });
    }

    if (typeof message !== "string" || message.length > 1000) {
      return res.status(400).json({
        error: "Your message must be text of 1,000 characters or fewer."
      });
    }

    const dietary =
      status === "attending"
        ? dietary_requirements.trim() || null
        : null;

    const result = await pool.query(
      `UPDATE guests
       SET status = $1,
           dietary_requirements = $2,
           message = $3,
           responded_at = CURRENT_TIMESTAMP
       WHERE guest_id = $4
       RETURNING name, status, responded_at`,
      [
        status,
        dietary,
        message.trim() || null,
        req.guest.guest_id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "This invitation is no longer available."
      });
    }

    res.json({
      success: true,
      guest: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

// Return only attending guests' display names.
router.get("/guests", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT display_name
       FROM guests
       WHERE status = 'attending'
       ORDER BY display_name, guest_id`
    );

    res.json({
      count: result.rowCount,
      guests: result.rows
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;