<script>
export default {
    data() {
        return {
            menuAberto: false,

            usuario: {
                nome: "Seu Nome",
                email: "email@gmail.com",
                imagem: null
            },

            favoritas: [
                { id: 1, titulo: "Musica 1", artista: "Artista A" },
                { id: 2, titulo: "Musica 2", artista: "Artista B" }
            ],

            modalEditar: false,
            novoNome: "",
            novaImagem: null,
            previewImagem: null
        }
    },

    mounted() {
        this.carregarUsuario();
    },

    methods: {
        abrirMenu() {
            this.menuAberto = !this.menuAberto
        },

        sair() {
            localStorage.removeItem("usuario");
            window.location.href = "/home";
        },

        carregarUsuario() {
            const usuarioSalvo = localStorage.getItem("usuario");

            if (usuarioSalvo) {
                const user = JSON.parse(usuarioSalvo);

                // 🔥 Monta URL completa apenas se houver imagem
                this.usuario = {
                    ...user,
                    imagem: user.imagem ? `https://spotfree-v1-1.onrender.com/uploads/${user.imagem}` : null
                };
            }
        },

        abrirEditar() {
            const usuarioSalvo = localStorage.getItem("usuario");

            if (!usuarioSalvo) {
                alert("Você precisa estar logado para editar o perfil!");
                window.location.href = "/login";
                return;
            }

            this.modalEditar = true;
            this.novoNome = this.usuario.nome;
            this.previewImagem = this.usuario.imagem; // 🔥 mostrar a imagem atual
        },

        fecharEditar() {
            this.modalEditar = false;
            this.novaImagem = null;
        },

        selecionarImagem(event) {
            const file = event.target.files[0];
            if (file) {
                this.novaImagem = file;
                this.previewImagem = URL.createObjectURL(file);
            }
        },

        async salvarPerfil() {
            const usuarioSalvo = localStorage.getItem("usuario");

            if (!usuarioSalvo) {
                alert("Sessão expirada. Faça login novamente.");
                window.location.href = "/login";
                return;
            }

            try {
                const usuario = JSON.parse(usuarioSalvo);

                const formData = new FormData();
                formData.append("nome", this.novoNome);
                formData.append("id", usuario.id);

                if (this.novaImagem) {
                    formData.append("imagem", this.novaImagem);
                }

                const response = await fetch("https://spotfree-v1-1.onrender.com/perfil", {
                    method: "PUT",
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.erro || "Erro no servidor");
                    return;
                }

                // 🔥 Atualiza front-end com URL completa
                this.usuario.nome = data.nome;
                this.usuario.imagem = data.imagem ? `https://spotfree-v1-1.onrender.com/uploads/${data.imagem}` : null;

                // 🔥 Salva apenas o filename no localStorage
                const usuarioParaSalvar = {
                    id: usuario.id,
                    nome: data.nome,
                    email: usuario.email,
                    imagem: data.imagem || null
                };
                localStorage.setItem("usuario", JSON.stringify(usuarioParaSalvar));

                this.modalEditar = false;
                this.novaImagem = null;

            } catch (erro) {
                console.error(erro);
                alert("Erro ao atualizar perfil");
            }
        }
    }
}
</script>

<template>
    <div class="container">
        <!-- HEADER -->
        <header class="header">
            <div class="logo-area">
                <img class="logo" src="../assets/SpotFree.png">
                <h1 class="logo-text">SpotFree</h1>
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
        </header>

        <!-- PERFIL -->
        <div class="perfil">
            <div class="topo">
                <div class="foto" v-if="!usuario.imagem"></div>
                <img v-else :src="usuario.imagem" class="foto-img">

                <h2>{{ usuario.nome }}</h2>
                <p>{{ usuario.email }}</p>

                <button class="editar" @click="abrirEditar">Editar Perfil</button>
                <button class="sair" @click="sair">Sair da Conta</button>
            </div>

            <div class="stats">
                <div class="box">
                    <h3>0</h3>
                    <p>Playlists</p>
                </div>
                <div class="box">
                    <h3>0</h3>
                    <p>Músicas</p>
                </div>
                <div class="box">
                    <h3>0</h3>
                    <p>Favoritas</p>
                </div>
            </div>

            <div class="favoritas">
                <h3>Músicas Favoritas</h3>
                <div class="card" v-for="musica in favoritas" :key="musica.id">
                    <div>
                        <h4>{{ musica.titulo }}</h4>
                        <p>{{ musica.artista }}</p>
                    </div>
                    <span class="heart">❤️</span>
                </div>
            </div>
        </div>

        <!-- MODAL EDITAR PERFIL -->
        <div v-if="modalEditar" class="modal-overlay">
            <div class="modal">
                <h2>Editar Perfil</h2>

                <input type="text" v-model="novoNome" placeholder="Novo nome" />

                <label class="upload">
                    Imagem
                    <input type="file" @change="selecionarImagem">
                </label>

                <img v-if="previewImagem" :src="previewImagem" class="preview">

                <button class="salvar" @click="salvarPerfil">Salvar</button>
                <button class="cancelar" @click="fecharEditar">Cancelar</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    min-height: 100vh;
    background: linear-gradient(to bottom, #000000, #1a001f);
    font-family: Arial;
    color: white;
}

/* HEADER */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
}

.logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo {
    height: 50px;
}

.logo-text {
    font-size: 26px;
}

/* PERFIL */
.perfil {
    max-width: 800px;
    margin: 40px auto;
    padding: 20px;
}

.topo {
    text-align: center;
}

.foto {
    width: 120px;
    height: 120px;
    background: #444;
    border-radius: 50%;
    margin: 0 auto 10px;
}

/* 🔥 FOTO REAL */
.foto-img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 10px;
}

.topo h2 {
    color: #A200FF;
}

.editar,
.sair {
    margin-top: 10px;
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    background: linear-gradient(45deg, #A200FF, #d633ff);
    cursor: pointer;
}

.stats {
    display: flex;
    justify-content: space-around;
    margin: 30px 0;
}

.box {
    text-align: center;
}

.box h3 {
    color: #A200FF;
}

.favoritas h3 {
    margin-bottom: 15px;
}

.card {
    display: flex;
    justify-content: space-between;
    background: rgba(0, 0, 0, 0.6);
    padding: 15px;
    border-radius: 10px;
    margin-bottom: 10px;
    transition: 0.3s;
}

.card:hover {
    background: rgba(162, 0, 255, 0.2);
}

.heart {
    cursor: pointer;
}

/* MENU */
.hamburguer {
    display: flex;
    flex-direction: column;
    gap: 5px;
    cursor: pointer;
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

.menu a:hover {
    color: #A200FF;
}

/* 🔥 MODAL */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal {
    background: #111;
    padding: 30px;
    border-radius: 15px;
    width: 300px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.modal input {
    padding: 10px;
    border-radius: 10px;
    border: none;
    background: #222;
    color: white;
}

.upload {
    background: #222;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
}

.upload input {
    display: none;
}

.preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    align-self: center;
}

.salvar {
    background: linear-gradient(45deg, #A200FF, #d633ff);
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
</style>