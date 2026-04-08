<script>
export default {
    data() {
        return {
            menuAberto: false,
            email: "",
            nome: "",
            senha: "",
            confirmarSenha: "",
            data_nascimento: ""
        }
    },

    methods: {
        abrirMenu() {
            this.menuAberto = !this.menuAberto
        },

        async cadastrar() {

            if (this.senha !== this.confirmarSenha) {
                return alert("Senhas não conferem");
            }

            try {
                const res = await fetch("https://spotfree-v1-1.onrender.com/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nome: this.nome,
                        email: this.email,
                        senha: this.senha,
                        confirmarSenha: this.confirmarSenha,
                        data_nascimento: this.data_nascimento
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    alert("Conta criada!");

                    this.nome = "";
                    this.email = "";
                    this.senha = "";
                    this.confirmarSenha = "";
                    this.data_nascimento = "";

                    this.$router.push("/login");
                } else {
                    alert(data.erro || "Erro ao cadastrar");
                }

            } catch (err) {
                console.error(err);
                alert("Erro no servidor");
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

            <div class="actions">
                <button class="logar" @click="$router.push('/login')">
                    Logar
                </button>

                <div class="hamburguer" @click="abrirMenu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

            <div v-if="menuAberto" class="menu">
                <a href="/home">Home</a>
                <a href="/music">Music</a>
                <a href="/perfil">Perfil</a>
            </div>
        </header>

        <!-- CADASTRO -->
        <div class="cadastro">

            <h2>Criar Conta</h2>

            <div class="input-group">
                <label>Email</label>
                <input v-model="email" type="text" placeholder="exemplo@gmail.com">
            </div>

            <div class="input-group">
                <label>Username</label>
                <input v-model="nome" type="text" placeholder="Seu nome">
            </div>

            <div class="input-group">
                <label>Senha</label>
                <input v-model="senha" type="password" placeholder="••••••">
            </div>

            <div class="input-group">
                <label>Confirmar Senha</label>
                <input v-model="confirmarSenha" type="password" placeholder="••••••">
            </div>

            <div class="input-group">
                <label>Data de nascimento</label>
                <input v-model="data_nascimento" type="date">
            </div>

            <button class="cadastrar" @click="cadastrar">Cadastrar</button>

            <p class="divider">ou continue com</p>

            <div class="social">
                <img src="../assets/facebook.png">
                <img src="../assets/Logo-Google.png">
            </div>

        </div>

    </div>
</template>

<style scoped>
/* 🔥 SEU CSS NÃO FOI ALTERADO */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.container {
    min-height: 100vh;
    background: linear-gradient(to bottom, #000000, #1a001f);
    font-family: Arial;
    color: white;
    display: flex;
    flex-direction: column;
}

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
    font-weight: bold;
}

.actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.cadastro {
    margin: 60px auto;
    width: 420px;
    padding: 40px;
    border-radius: 20px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    gap: 15px;
    box-shadow: 0 0 30px rgba(162,0,255,0.3);
}

.cadastro h2 {
    text-align: center;
    color: #A200FF;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.input-group input {
    padding: 10px;
    background: transparent;
    border: none;
    border-bottom: 2px solid #555;
    color: white;
    outline: none;
    transition: 0.3s;
}

.input-group input:focus {
    border-bottom: 2px solid #A200FF;
}

.input-group input:hover{
    border-bottom: 2px solid #A200FF;
}

.cadastrar {
    margin-top: 10px;
    padding: 12px;
    background: linear-gradient(45deg, #A200FF, #d633ff);
    border: none;
    border-radius: 25px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
}

.cadastrar:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(162,0,255,0.6);
}

.social {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.social img {
    width: 50px;
    cursor: pointer;
    transition: 0.3s;
}

.social img:hover {
    transform: scale(1.1);
}

.divider {
    text-align: center;
    font-size: 14px;
    color: #aaa;
}

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

.logar {
    padding: 10px 20px;
    border-radius: 20px;
    background: linear-gradient(45deg, #A200FF, #d633ff);
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
}

.logar:hover {
    transform: scale(1.05);
}
</style>