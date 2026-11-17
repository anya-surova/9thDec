const party = {
    title: "Anya’s Birthday",
    introduction: "Come celebrate with me! An evening of food, laughter and memories.",
    date: "Date to be confirmed",
    time: "Time to be confirmed",
    venue: "Venue to be confirmed",
    dressCode: "Dress code to be confirmed",
    plan: "Food, games, photos and birthday cake!",
    rsvpDeadline: "To be confirmed",
    mapsUrl: ""
};

document.querySelectorAll("[data-party]").forEach((element) => {
    const key = element.dataset.party;
    element.textContent = party[key] || "";
});

document.querySelectorAll("https://maps.app.goo.gl/vXQ4e3YkKhZT6AZk6").forEach((link) => {
    if (party.mapsUrl) {
        link.href = party.mapsUrl;
        link.hidden = false;
    }
});