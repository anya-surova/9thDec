const form = document.getElementById("rsvp-form");
const fields = document.getElementById("rsvp-fields");
const guestName = document.getElementById("guest-name");
const loadStatus = document.getElementById("load-status");
const retryButton = document.getElementById("retry-load");
const savedResponse = document.getElementById("saved-response");
const dietarySection = document.getElementById("dietary-section");
const dietaryInput = document.getElementById("dietary");
const messageInput = document.getElementById("message");
const submitButton = document.getElementById("submit-rsvp");
const formStatus = document.getElementById("form-status");

let saving = false;

function updateDietaryVisibility() {
    const selected = form.querySelector('input[name="status"]:checked');
    dietarySection.hidden = selected?.value !== "attending";
}

async function loadInvitation() {
    form.hidden = true;
    retryButton.hidden = true;
    loadStatus.textContent = "Loading your invitation…";

    try {
        const guest = await apiRequest("/invitation");

        guestName.value = guest.name;
        dietaryInput.value = guest.dietary_requirements || "";
        messageInput.value = guest.message || "";

        form.querySelectorAll('input[name="status"]').forEach((radio) => {
            radio.checked = radio.value === guest.status;
        });

        const alreadyResponded = guest.status !== "pending";

        savedResponse.hidden = !alreadyResponded;
        savedResponse.textContent = alreadyResponded
            ? `Your saved answer: ${guest.status === "attending" ? "Attending" : "Unable to attend"
            }. You can update it below.`
            : "";

        submitButton.textContent = alreadyResponded
            ? "Update RSVP"
            : "Send RSVP";

        updateDietaryVisibility();
        loadStatus.textContent = "";
        form.hidden = false;
    } catch (error) {
        loadStatus.textContent = error.message;
        retryButton.hidden = false;
    }
}

form.addEventListener("change", updateDietaryVisibility);
retryButton.addEventListener("click", loadInvitation);

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (saving || !form.reportValidity()) return;

    const selected = form.querySelector('input[name="status"]:checked');

    const response = {
        status: selected.value,
        dietary_requirements:
            selected.value === "attending" ? dietaryInput.value.trim() : "",
        message: messageInput.value.trim()
    };

    const previousLabel = submitButton.textContent;

    saving = true;
    fields.disabled = true;
    submitButton.textContent = "Saving…";
    formStatus.textContent = "";

    try {
        const result = await apiRequest("/rsvp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(response)
        });

        if (!result.success) {
            throw new Error("Your RSVP could not be saved. Please try again.");
        }

        goToPage(
            result.guest.status === "attending"
                ? "confirmed.html"
                : "unavailable.html"
        );
    } catch (error) {
        formStatus.textContent = error.message;
    } finally {
        saving = false;
        fields.disabled = false;
        submitButton.textContent = previousLabel;
    }
});

loadInvitation();

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        loadInvitation();
    }
});