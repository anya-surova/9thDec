const flyer = document.getElementById("flyer");
const envelope = document.getElementById("envelope");
const openButton = document.getElementById("open-button");
const returnButton = document.getElementById("return-button");
const greeting = document.getElementById("greeting");
const notice = document.getElementById("notice");

let busy = false;

function setBusy(value) {
    busy = value;
    envelope.disabled = value;
    openButton.disabled = value;
    returnButton.disabled = value;
    flyer.classList.toggle("paused", value);
}

async function openInvitation() {
    if (busy) return;

    setBusy(true);
    notice.textContent = "Opening your invitation…";

    try {
        // Check the invitation before navigating.
        await apiRequest("/invitation");

        envelope.classList.add("open");

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        window.setTimeout(() => {
            goToPage("invitation.html");
        }, reducedMotion ? 150 : 1400);
    } catch (error) {
        notice.textContent = error.message;
        setBusy(false);
    }
}

async function viewExistingResponse() {
    if (busy) return;

    setBusy(true);
    notice.textContent = "Checking your RSVP…";

    try {
        const guest = await apiRequest("/invitation");

        if (guest.status === "pending") {
            goToPage("invitation.html");
        } else {
            goToPage("details.html");
        }
    } catch (error) {
        notice.textContent = error.message;
        setBusy(false);
    }
}

envelope.addEventListener("click", openInvitation);
openButton.addEventListener("click", openInvitation);
returnButton.addEventListener("click", viewExistingResponse);

// Add the guest's name safely as plain text.
apiRequest("/invitation")
    .then((guest) => {
        greeting.textContent = `${guest.name}, this one’s for you.`;
    })
    .catch((error) => {
        if (!busy) {
            notice.textContent = error.message;
        }
    });

// Restore the entrance if the browser restores it with the Back button.
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        setBusy(false);
        envelope.classList.remove("open");
        notice.textContent = "";
    }
});