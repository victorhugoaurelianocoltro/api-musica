document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const artistId = params.get("artistId");

    if (artistId) {
        const artistName = params.get("artistName");
        document.getElementById("page-title").innerText = `Músicas de ${artistName}`;
        document.getElementById("search-section").style.display = 'none';
        loadArtistSongs(artistId);
    }
});

// buscar artistas e músicas
async function search() {
    const query = document.getElementById("search-input").value.trim();
    if (!query) return;

    try {
        // Buscar artistas
        const artistResponse = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=15`);
        if (!artistResponse.ok) throw new Error(`Erro ${artistResponse.status}: ${artistResponse.statusText}`);
        const artistData = await artistResponse.json();
        displayArtists(artistData.results);

        // Buscar músicas
        const songResponse = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`);
        if (!songResponse.ok) throw new Error(`Erro ${songResponse.status}: ${songResponse.statusText}`);
        const songData = await songResponse.json();
        displaySongs(songData.results);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}


async function getArtistImage(artistId) {
    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=1`);
        if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);
        const data = await response.json();
        const album = data.results.find(item => item.collectionType === "Album");
        return album ? album.artworkUrl100.replace("100x100", "400x400") : "";
    } catch (error) {
        console.error("Erro ao buscar imagem do artista:", error);
        return "";
    }
}


async function displayArtists(artists) {
    const container = document.getElementById("artists-container");
    container.innerHTML = "";

   

    for (const artist of artists) {
        const imageUrl = await getArtistImage(artist.artistId);

        const card = document.createElement("div");
        card.classList.add("artist-card");
        card.innerHTML = `
            <img src="${imageUrl || 'placeholder.jpg'}" alt="${artist.artistName}" class="artist-image">
            <h3>${artist.artistName}</h3>
            <p>Gênero: ${artist.primaryGenreName || "Desconhecido"}</p>
        `;
        card.onclick = () => {
            window.location.href = `?artistId=${artist.artistId}&artistName=${encodeURIComponent(artist.artistName)}`;
        };
        container.appendChild(card);
    }
}

function displaySongs(songs) {
    const container = document.getElementById("songs-container");
    container.innerHTML = "";

    const tracks = songs.filter(item => item.wrapperType === "track");

    if (tracks.length === 0) {
        container.innerHTML = "<p>Nenhuma música encontrada.</p>";
        return;
    }

    tracks.forEach(track => {
        const songCard = document.createElement("div");
        songCard.classList.add("song-card");
        songCard.innerHTML = `
            <img src="${track.artworkUrl100}" alt="${track.trackName}" class="song-image">
            <h3>${track.trackName}</h3>
            <audio controls>
                <source src="${track.previewUrl}" type="audio/mpeg">
                Seu navegador não suporta a reprodução de áudio.
            </audio>
        `;
        container.appendChild(songCard);
    });
}


async function loadArtistSongs(artistId) {
    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=song&limit=15`);
        if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);
        const data = await response.json();
        displaySongs(data.results);
    } catch (error) {
        console.error("Erro ao buscar músicas:", error);
        document.getElementById("songs-container").innerHTML = "<p>Erro ao carregar músicas.</p>";
    }
}
