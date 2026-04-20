// Ye function video ka asli download link nikalega
async function getCobaltLink(videoUrl) {
    try {
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: "720",
                filenamePattern: "basic"
            })
        });
        const data = await response.json();
        return data.url || data.picker?.[0]?.url;
    } catch (e) {
        return null;
    }
}

// Button generate karte waqt ye use karo
res.medias.forEach(async (item) => {
    // Backend proxy ke bajaye, hum direct Cobalt ka link nikalenge
    const directDownloadUrl = await getCobaltLink(originalInputUrl); 

    downloadButtons.innerHTML += `
        <a href="${directDownloadUrl || '#'}" target="_blank" class="w-full py-4 bg-cyan-500 text-black rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2">
            <span>DOWNLOAD ${item.quality}</span>
            <i class="fa-solid fa-circle-down"></i>
        </a>
    `;
});
