async function showResult() {
    const title = document.getElementById("result-title");
    const message = document.getElementById("result-message");

    try {
        const guest = await apiRequest("/invitation");

        if (guest.status === "pending") {
            goToPage("invitation.html");
            return;
        }

        const attending = guest.status === "attending";

        title.textContent = attending
            ? "You’re on the list!"
            : "You’ll be missed.";

        message.textContent = attending
            ? `${guest.name}, your RSVP is saved. I can’t wait to celebrate with you!`
            : `${guest.name}, your response is saved. Thank you for letting me know!`;

        document.title = attending
            ? "You’re on the list!"
            : "Thank you for responding";

        document.getElementById("result-actions").hidden = false;
    } catch (error) {
        title.textContent = "Couldn’t check your RSVP";
        message.textContent = error.message;
        document.getElementById("result-retry").hidden = false;
    }
}

showResult();

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        window.location.reload();
    }
});