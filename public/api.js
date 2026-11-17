// Keep each browser tab's invitation separate.
const invitationParameters = new URLSearchParams(
    window.location.hash.slice(1)
);

const incomingToken = invitationParameters.get("invite");
let invitationToken = "";

try {
    invitationToken = sessionStorage.getItem("birthdayInviteToken") || "";
} catch {
    // The original invitation link still works if storage is unavailable.
}

if (incomingToken !== null) {
    // A new invitation link always overrides a previously opened one.
    invitationToken = /^[a-f0-9]{64}$/.test(incomingToken)
        ? incomingToken
        : "";

    try {
        if (invitationToken) {
            sessionStorage.setItem("birthdayInviteToken", invitationToken);
        } else {
            sessionStorage.removeItem("birthdayInviteToken");
        }
    } catch {
        // Navigation also carries the token in the URL fragment.
    }
}

async function apiRequest(endpoint, options = {}) {
    if (!invitationToken) {
        throw new Error("Please reopen your personal invitation link.");
    }

    let response;

    try {
        response = await fetch(`/api${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${invitationToken}`
            },
            cache: "no-store"
        });
    } catch {
        throw new Error("Could not connect. Please try again.");
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
    }

    return data;
}

function goToPage(filename) {
    const destination = new URL(filename, window.location.href);

    if (invitationToken) {
        destination.hash = new URLSearchParams({
            invite: invitationToken
        }).toString();
    }

    window.location.assign(destination.href);
}