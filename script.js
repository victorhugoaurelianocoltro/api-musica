document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);   //aqui mostra se tiver um artista na URL, significa se o usuário clicou em um artista. 
    const artistId = params.get("artistId");



    //qui se o artista existir, ele pega o nome do artista da URL
    if (artistId) {
        const artistName = params.get("artistName");

        //muda o titulo, uqe seria "Cantor" para o nome do artista
        document.getElementById("page-title").innerText = `Músicas de ${artistName}`;
        document.getElementById("search-section").style.display = 'none';  // aqui é simples, a função só esconde a barra de pesquisa, quando pesquiso uma musica espesifica.
        loadArtistSongs(artistId); // chama a função dos artistas, até carrega os atistas
    }
});

// buscar artistas e músicas
async function search() {  // aqui só busca as informações da API
    const query = document.getElementById("search-input").value.trim();  // remove oque o usuario digitou errado
    if (!query) return;

    try {
        // Buscar artistas
        const artistResponse = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=15`); // aqui ele puxa os aristas quando pesquisa por ele na barra
        if (!artistResponse.ok) throw new Error(`Erro ${artistResponse.status}: ${artistResponse.statusText}`); // se não achar o artista ele volta um erro
       
       
        const artistData = await artistResponse.json();  //só converte a resposta em Json, exemplo: nome do artista e etc.
        displayArtists(artistData.results);// chama a função para exibir os artistas  

        // Buscar músicas
        const songResponse = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`);  //aqui ele puxa pelo nome da musica digitado
        if (!songResponse.ok) throw new Error(`Erro ${songResponse.status}: ${songResponse.statusText}`); // se não achar a musica ele volta um erro 
        const songData = await songResponse.json();  //só converte a resposta em Json, exemplo: nome do artista e etc. 
        displaySongs(songData.results); // chama a função para exibir as musicas
    } catch (error) {
        console.error("Erro ao buscar dados:", error);  // volta um erro, como ja esta falando "Erro ao buscar dados" .
    }
}


async function getArtistImage(artistId) {
    try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=1`);  // a mesma coisa só que aqui ele puxa a imagem da muusica do artista procurado.
        if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);  //se não achar a imagem da um erro, e a imagem não aparece
        const data = await response.json(); // converte a resposta em Json
        const album = data.results.find(item => item.collectionType === "Album");
        return album ? album.artworkUrl100.replace("100x100", "400x400") : "";  //Tenta encontrar um álbum "imagem" dentro dos resultados.
    } catch (error) {
        console.error("Erro ao buscar imagem do artista:", error);   //da um erro se não encontra a imagem
        return "";
    }
}


async function displayArtists(artists) { //volta uma função que funciona ao mesmo tempo que outra função que exibe os artistas na página.
  
 // limpa tudo aonde os artistas serão mostrados
    const container = document.getElementById("artists-container");  
    container.innerHTML = "";

   

    for (const artist of artists) { //Pra cada artista encontrado na busca, serve para conter varios artistas, com o nome da muisca, imagem e etc?
        const imageUrl = await getArtistImage(artist.artistId); //Pega a imagem do artista chamando getArtistImage().


        //Cria um novo div e adiciona a classe artist-card,  no caso a imagem do cantor
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
