<script>
export default {
    data() {
        return {
            menuAberto: false,
            email: "",
            senha: ""
        }
    },
    methods: {
        abrirMenu() {
            this.menuAberto = !this.menuAberto
        },
        async login() {
            try {
                const res = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: this.email,
                        senha: this.senha
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    alert("Login realizado!");

                    // salvar usuário (opcional)
                    localStorage.setItem("usuario", JSON.stringify(data.usuario));

                    this.$router.push("/music");
                } else {
                    alert(data.erro);
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
                <img class="logo" src="../assets/SpotFree.png" />
                <h1 class="logo-text">SpotFree</h1>
            </div>

            <div class="actions">
                <button class="cadastro" @click="$router.push('/cadastro')">
                    Cadastrar-se
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

        <!-- LOGIN -->
        <div class="login">

            <h2>Login</h2>

            <div class="input-group">
                <label>Email</label>
                <input v-model="email" type="text" placeholder="exemplo@gmail.com" />
            </div>

            <div class="input-group">
                <label>Senha</label>
                <input v-model="senha" type="password" placeholder="••••••" />
            </div>

            <button class="button" @click="login">Entrar</button>

            <p class="divider">ou continue com</p>

            <div class="social">
                <img src="../assets/facebook.png" />
                <img src="../assets/Logo-Google.png" />
            </div>

        </div>

    </div>
</template>

<style scoped>
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
    font-weight: bold;
}

/* AÇÕES */
.actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

/* LOGIN */
.login {
    margin: 80px auto;
    width: 400px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    padding: 40px;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-shadow: 0 0 30px rgba(162, 0, 255, 0.3);
}

/* INPUTS */
.input-group {
    display: flex;
    flex-direction: column;
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

.input-group input:hover {
    border-bottom: 2px solid #A200FF;
}

/* BOTÃO */
.button {
    padding: 12px;
    background: linear-gradient(45deg, #A200FF, #d633ff);
    border: none;
    border-radius: 25px;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
}

.button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(162, 0, 255, 0.6);
}

/* SOCIAL */
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
    transform: scale(1.05);
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

/* BOTÃO CADASTRO */
.cadastro {
    padding: 10px 20px;
    border-radius: 20px;
    background: linear-gradient(45deg, #A200FF, #d633ff);
    border: none;
    font-weight: bold;
    cursor: pointer;
    transition: 0.3s;
}

.cadastro:hover {
    transform: scale(1.05);
}

.divider {
    color: #aaa;
    align-self: center;
    justify-self: center;
}

h2 {
    color: #A200FF;
    align-self: center;
    justify-self: center;

}
</style>