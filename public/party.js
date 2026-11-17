const party = {
    title: "Anna’s Birthday",
    introduction: "Come have a fun evening and celebrate the big 20th!",
    date: "9th December",
    time: "6 to 9pm",
    venue: "Function Room @ 18 Cavendish Park",
    dressCode: "Colour & Sparkle!",
    plan: "Food, games, swim! Bring your swim wear",
    rsvpDeadline: "1st December",
    mapsUrl: "https://maps.app.goo.gl/vXQ4e3YkKhZT6AZk6"
};

document.querySelectorAll("[data-party]").forEach((element) => {
    const key = element.dataset.party;
    element.textContent = party[key] || "";
});

document.querySelectorAll("[data-maps-link]").forEach((link) => {
    if (party.mapsUrl) {
        link.href = party.mapsUrl;
        link.hidden = false;
    }
});