const crypto = require("crypto");
const pool = require("./db");

async function createInvite() {
  try {
    const guestId = Number(process.argv[2]);

    if (!Number.isInteger(guestId) || guestId < 1) {
      throw new Error("Enter a guest ID. Example: node create-invite.js 1");
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const result = await pool.query(
      `UPDATE guests
       SET invite_token_hash = $1
       WHERE guest_id = $2
       RETURNING name`,
      [tokenHash, guestId]
    );

    if (result.rowCount === 0) {
      throw new Error("No guest exists with that ID.");
    }

    const port = process.env.PORT || 3000;

    console.log(`Invitation for: ${result.rows[0].name}`);
    console.log(`http://127.0.0.1:${port}/#invite=${token}`);
    console.log("\nSave this link privately.");
    console.log("Generating another link for this guest replaces their old one.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createInvite();