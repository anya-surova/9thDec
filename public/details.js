const guestStatus = document.getElementById("guest-status");
const content = document.getElementById("details-content");
const guestCount = document.getElementById("guest-count");
const guestList = document.getElementById("guest-list");
const refreshButton = document.getElementById("refresh-guests");
const retryButton = document.getElementById("retry-details");

async function loadGuestList() {
    refreshButton.disabled = true;
    guestCount.textContent = "Loading confirmed guests…";
    guestList.replaceChildren();

    try {
        const data = await apiRequest("/guests");

        guestCount.textContent = data.count === 0
            ? "No confirmed guests yet. Check back soon!"
            : `${data.count} ${data.count === 1 ? "guest" : "guests"} confirmed`;

        data.guests.forEach((guest) => {
            const item = document.createElement("li");
            item.textContent = guest.display_name;
            guestList.appendChild(item);
        });
    } catch (error) {
        guestCount.textContent = error.message;
    } finally {
        refreshButton.disabled = false;
    }
}

async function loadDetails() {
    content.hidden = true;
    retryButton.hidden = true;
    guestStatus.textContent = "Checking your response…";

    try {
        const guest = await apiRequest("/invitation");

        if (guest.status === "pending") {
            goToPage("invitation.html");
            return;
        }

        guestStatus.textContent =
            `${guest.name}, your saved response is: ` +
            (guest.status === "attending" ? "Attending." : "Unable to attend.");

        content.hidden = false;
        await loadGuestList();
    } catch (error) {
        guestStatus.textContent = error.message;
        retryButton.hidden = false;
    }
}

refreshButton.addEventListener("click", loadGuestList);
retryButton.addEventListener("click", loadDetails);

loadDetails();

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        loadDetails();
    }
});