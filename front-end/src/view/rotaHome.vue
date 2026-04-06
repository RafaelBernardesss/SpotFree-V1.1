<script>
export default{
    data() {
        return {
            menuAberto: false
        }
    },

    methods: {
        abrirMenu() {
            this.menuAberto = !this.menuAberto
        },

        comecar() {
            const usuario = localStorage.getItem("usuario");

            if (usuario) {
                this.$router.push("/music");
            } else {
                this.$router.push("/login");
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
                <img class="logo" src="../assets/SpotFree.png" alt="">
                <h1 class="txtlogo">SpotFree</h1>
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

        <!-- HERO -->
        <section class="hero">
            <h2>COMECE A ESCUTAR MÚSICAS GRATUITAMENTE</h2>
            <p>Descubra artistas, crie playlists e curta suas músicas favoritas.</p>

            <button class="cmc" @click="comecar">COMEÇAR A OUVIR</button>
        </section>

        <!-- DESTAQUES -->
        <section class="destaques">
            <h3>Destaques</h3>

            <div class="cards">
                <div class="card">🎧 Pop</div>
                <div class="card">🔥Eletrônica</div>
                <div class="card">🎸 Rock</div>
            </div>
        </section>

    </div>
</template>
<style lang="css">
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

.txtlogo {
    font-size: 28px;
    font-weight: bold;
}

/* HERO */
.hero {
    text-align: center;
    margin-top: 100px;
}

.hero h2 {
    color: #A200FF;
    font-size: 42px;
}

.hero p {
    margin-top: 10px;
    color: #ccc;
}

/* BOTÃO */
.cmc {
    margin-top: 40px;
    padding: 15px 40px;
    background: linear-gradient(45deg, #A200FF, #d633ff);
    color: black;
    font-size: 20px;
    font-weight: bold;
    border-radius: 30px;
    border: none;
    cursor: pointer;

    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(162,0,255,0.4);
}

.cmc:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 25px rgba(162,0,255,0.7);
}

/* DESTAQUES */
.destaques {
    margin-top: 80px;
    padding: 20px;
}

.destaques h3 {
    margin-bottom: 20px;
}

.cards {
    display: flex;
    gap: 20px;
}

.card {
    background: #1e1e1e;
    padding: 30px;
    border-radius: 15px;
    cursor: pointer;
    transition: 0.3s;
}

.card:hover {
    transform: scale(1.05);
    background: #2a2a2a;
}

/* MENU */
.hamburguer {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.hamburguer span {
    width: 30px;
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
    margin: 5px 0;
}

.menu a:hover {
    color: #A200FF;
}
</style>
