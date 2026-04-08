<script>
export default {
    data() {
        return {
            menuAberto: false,
            modal: false,

            favoritas: [],

            titulo: "",
            artista: "",
            imagem: null,
            audio: null,

            nomeImagem: "",
            nomeAudio: "",

            busca: "",
            hover: null,
            musicaAtual: null,

            audioPlayer: null,
            tocando: false,
            progresso: 0,
            tempoAtual: "0:00",
            duracao: "0:00",
            volume: 1
        }
    },

    computed: {
        musicasFiltradas() {
            if (!this.busca) return this.favoritas

            return this.favoritas.filter(m =>
                (m.titulo || "").toLowerCase().includes(this.busca.toLowerCase()) ||
                (m.artista || "").toLowerCase().includes(this.busca.toLowerCase())
            )
        }
    },

    methods: {
        abrirMenu() {
            this.menuAberto = !this.menuAberto
        },

        selecionarImagem(e) {
            const file = e.target.files[0]
            if (!file) return

            if (!file.type.startsWith("image/")) {
                alert("Escolha uma imagem válida")
                return
            }

            this.imagem = file
            this.nomeImagem = file.name
        },

        selecionarAudio(e) {
            const file = e.target.files[0]
            if (!file) return

            if (!file.type.startsWith("audio/")) {
                alert("Escolha um áudio válido (MP3)")
                return
            }

            this.audio = file
            this.nomeAudio = file.name
        },

        async salvarMusica() {
            try {
                const formData = new FormData()

                formData.append("titulo", this.titulo)
                formData.append("artista", this.artista)

                if (this.imagem) formData.append("imagem", this.imagem)
                if (this.audio) formData.append("audio", this.audio)

                const res = await fetch("https://spotfree-v1-1.onrender.com/musicas", {
                    method: "POST",
                    body: formData
                })

                const data = await res.json()

                if (!res.ok) {
                    alert(data.erro || "Erro ao salvar")
                    return
                }

                this.titulo = ""
                this.artista = ""
                this.imagem = null
                this.audio = null
                this.nomeImagem = ""
                this.nomeAudio = ""
                this.modal = false

                this.carregarFavoritas()

            } catch {
                alert("Erro ao enviar")
            }
        },

        async carregarFavoritas() {
            const res = await fetch("https://spotfree-v1-1.onrender.com/musicas")
            this.favoritas = await res.json()
        },

        formatarTempo(seg) {
            if (!seg || isNaN(seg)) return "0:00"
            const min = Math.floor(seg / 60)
            const sec = Math.floor(seg % 60).toString().padStart(2, "0")
            return `${min}:${sec}`
        },

        tocar(musica) {
            if (!musica.audio) {
                alert("Essa música não possui áudio")
                return
            }

            if (this.musicaAtual && this.musicaAtual.id === musica.id) {
                this.togglePlay()
                return
            }

            this.musicaAtual = musica

            if (this.audioPlayer) {
                this.audioPlayer.pause()
                this.audioPlayer = null
            }

            this.progresso = 0
            this.tempoAtual = "0:00"
            this.duracao = "0:00"

            this.audioPlayer = new Audio(`https://spotfree-v1-1.onrender.com/uploads/${musica.audio}`)
            this.audioPlayer.volume = this.volume

            this.audioPlayer.play()
            this.tocando = true

            this.audioPlayer.onloadedmetadata = () => {
                if (this.audioPlayer.duration) {
                    this.duracao = this.formatarTempo(this.audioPlayer.duration)
                }
            }

            this.audioPlayer.ontimeupdate = () => {
                if (!this.audioPlayer.duration) return

                this.progresso =
                    (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100

                this.tempoAtual = this.formatarTempo(this.audioPlayer.currentTime)
            }

            this.audioPlayer.onended = () => {
                this.proxima()
            }
        },

        togglePlay() {
            if (!this.audioPlayer) return

            if (this.tocando) {
                this.audioPlayer.pause()
            } else {
                this.audioPlayer.play()
            }

            this.tocando = !this.tocando
        },

        mudarTempo(e) {
            if (!this.audioPlayer || !this.audioPlayer.duration) return

            const tempo = (e.target.value / 100) * this.audioPlayer.duration
            this.audioPlayer.currentTime = tempo
        },

        mudarVolume(e) {
            this.volume = e.target.value
            if (this.audioPlayer) {
                this.audioPlayer.volume = this.volume
            }
        },

        proxima() {
            if (!this.musicaAtual) return

            const index = this.favoritas.findIndex(m => m.id === this.musicaAtual.id)
            const prox = this.favoritas[index + 1]

            if (prox) this.tocar(prox)
            else this.tocando = false
        },

        anterior() {
            if (!this.musicaAtual) return

            const index = this.favoritas.findIndex(m => m.id === this.musicaAtual.id)

            if (index > 0) {
                this.tocar(this.favoritas[index - 1])
            }
        }
    },

    mounted() {
        this.carregarFavoritas()
    }
}
</script>

<template>
    <div class="container">

        <aside class="sidebar">
            <div class="logo-box">
                <img src="../assets/SpotFree.png" class="logo">
                <h2>SpotFree</h2>
            </div>

            <button class="btn-add" @click="modal = true">+ Música</button>
        </aside>

        <main class="main">
            <div class="top">
                <input v-model="busca" placeholder="O que você quer ouvir?" />
            </div>

            <div class="lista">
                <div class="linha header">
                    <span>#</span>
                    <span>Título</span>
                    <span>Artista</span>
                    <span></span>
                </div>

                <div class="linha" v-for="(musica, index) in musicasFiltradas" :key="musica.id">

                    <span>{{ index + 1 }}</span>

                    <div class="titulo">
                        <img v-if="musica.imagem" :src="`http://localhost:3000/uploads/${musica.imagem}`"
                            class="capa" />
                        <div v-else class="capa"></div>

                        {{ musica.titulo }}
                    </div>

                    <span>{{ musica.artista }}</span>

                    <button class="iniciar" @click="tocar(musica)">▶</button>
                </div>
            </div>
        </main>

        <!-- PLAYER -->
        <footer class="player" v-if="musicaAtual">
            <div class="info">
                <img v-if="musicaAtual.imagem" :src="`http://localhost:3000/uploads/${musicaAtual.imagem}`"
                    class="mini-capa" />

                <div>
                    <p>{{ musicaAtual.titulo }}</p>
                    <span>{{ musicaAtual.artista }}</span>
                </div>
            </div>

            <div class="controls">
                <button @click="anterior">⏮</button>
                <button class="play-big" @click="togglePlay">
                    {{ tocando ? "⏸" : "▶" }}
                </button>
                <button @click="proxima">⏭</button>
            </div>

            <div class="barra">
                <span>{{ tempoAtual }}</span>
                <input type="range" :value="progresso" @input="mudarTempo">
                <span>{{ duracao }}</span>
            </div>

            <div class="volume">
                🔊
                <input type="range" min="0" max="1" step="0.01" :value="volume" @input="mudarVolume">
            </div>
        </footer>

        <!-- MODAL -->
        <div v-if="modal" class="modal">
            <div class="modal-box">
                <h3>Adicionar Música</h3>

                <input v-model="titulo" placeholder="Título">
                <input v-model="artista" placeholder="Artista">

                <!-- IMAGEM -->
                <label class="file">
                    <span class="file-btn">Imagem</span>
                    <span class="file-text">{{ nomeImagem || "Nenhum arquivo escolhido" }}</span>
                    <input type="file" accept="image/*" @change="selecionarImagem">
                </label>

                <!-- AUDIO -->
                <label class="file">
                    <span class="file-btn">MP3</span>
                    <span class="file-text">{{ nomeAudio || "Nenhum arquivo escolhido" }}</span>
                    <input type="file" accept="audio/mp3,audio/*" @change="selecionarAudio">
                </label>

                <button class="salvar" @click="salvarMusica">Salvar</button>
                <button class="cancelar" @click="modal = false">Cancelar</button>
            </div>
        </div>

        <div class="hamburguer" @click="abrirMenu">
            <span></span>
            <span></span>
            <span></span>
        </div>

        <div v-if="menuAberto" class="menu">
            <a href="/home">Home</a>
            <a href="/music">Music</a>
            <a href="/perfil">Perfil</a>
        </div>

    </div>
</template>

<style scoped>
/* SEU CSS ORIGINAL + ADIÇÃO NO FINAL */

.file {
    background: #222;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
}

.file input {
    display: none;
}

.file-btn {
    background: #444;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 12px;
}

.file-text {
    font-size: 12px;
    color: #ccc;
}
</style>

<style scoped>
.container {
    display: flex;
    height: 100vh;
    background: linear-gradient(to bottom, #000000, #1a001f);
    color: white;
    font-family: Arial, Helvetica, sans-serif;
}

/* SIDEBAR */
.sidebar {
    width: 220px;
    background: #0d0d0d;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.logo-box {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo {
    width: 40px;
}

.btn-add {
    margin-top: 20px;
    background: linear-gradient(45deg, #A200FF, #d633ff);
    border: none;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.3s;
}

.btn-add:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 25px rgba(162, 0, 255, 0.7);
}

/* MAIN */
.main {
    flex: 1;
    padding: 20px;
}

/* TOPO */
.top input {
    width: 400px;
    padding: 10px;
    border-radius: 20px;
    background: #111;
    border: none;
    color: white;
}

/* LISTA */
.lista {
    margin-top: 20px;
}

.linha {
    display: grid;
    grid-template-columns: 50px 1fr 1fr 100px;
    padding: 10px;
    align-items: center;
    transition: 0.2s;
}

.linha:hover {
    background: #1a001f;
}

.header {
    color: gray;
}

/* CAPA */
.capa {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    object-fit: cover;
    background: linear-gradient(45deg, #A200FF, #d633ff);
}

.titulo {
    display: flex;
    gap: 10px;
    align-items: center;
}

/* PLAYER */
.player {
    position: fixed;
    bottom: 0;
    left: 220px;
    right: 0;
    height: 100px;
    background: linear-gradient(to right, #0d0d0d, #1a001f);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-top: 1px solid #222;
}

/* INFO */
.info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.mini-capa {
    width: 55px;
    height: 55px;
    border-radius: 8px;
    object-fit: cover;
    background: linear-gradient(45deg, #A200FF, #d633ff);
}

/* CONTROLES */
.controls {
    display: flex;
    align-items: center;
    gap: 15px;
}

.controls button {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: 0.2s;
}

.controls button:hover {
    transform: scale(1.2);
}

.play-big {
    background: linear-gradient(45deg, #A200FF, #d633ff);
    border-radius: 50%;
    width: 45px;
    height: 45px;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* BARRA */
.barra {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 300px;
}

.barra span {
    font-size: 12px;
    color: #ccc;
}

.barra input[type="range"] {
    flex: 1;
    appearance: none;
    height: 5px;
    border-radius: 5px;
    background: #333;
    outline: none;
}

.barra input[type="range"]::-webkit-slider-runnable-track {
    height: 5px;
    background: linear-gradient(to right, #A200FF, #d633ff);
    border-radius: 5px;
}

.barra input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -3px;
}

/* VOLUME */
.volume {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 120px;
}

.volume input {
    width: 100%;
}

/* MODAL */
.modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-box {
    background: linear-gradient(180deg, #111, #1a001f);
    padding: 30px;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 320px;
    box-shadow: 0 0 20px #A200FF;
}

.modal-box input {
    padding: 10px;
    border-radius: 10px;
    border: none;
    background: #222;
    color: white;
}

/* BOTÕES MODAL */
.salvar {
    background: #A200FF;
    border: none;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
}

.cancelar {
    background: gray;
    border: none;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
}

/* BOTÃO PLAY */
.iniciar {
    background: linear-gradient(45deg, #A200FF, #d633ff);
    border: none;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    color: white;
    cursor: pointer;
    transition: 0.2s;
}

.iniciar:hover {
    transform: scale(1.2);
}

/* ===== ADIÇÃO (NÃO REMOVE NADA ACIMA) ===== */

.file {
    background: #222;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
}

.file input {
    display: none;
}

.file-btn {
    background: #444;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 12px;
}

.file-text {
    font-size: 12px;
    color: #ccc;
}
/* MENU */
.hamburguer {
    display: flex;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;   
    position: absolute;
    right: 20px;
    top:40px 
}

.hamburguer span {
    width: 25px;
    height: 3px;
    background: white;

}

.menu {
    position: absolute;
    top: 70px;
    right: 20px;
    background: #111;
    padding: 15px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
}

.menu a {
    color: white;
    text-decoration: none;
}

.menu a:hover{
    color:#A200FF;
}
</style>