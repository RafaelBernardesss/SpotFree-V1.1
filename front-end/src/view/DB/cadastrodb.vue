<script>
export default {
  data() {
    return {
      titulo: "",
      artista: "",
      genero: "",
      arquivo: ""
    }
  },
  methods: {
    async cadastrarMusica() {
      try {
        const resposta = await fetch("https://spotfree-v1-1.onrender.com/musicas", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            titulo: this.titulo,
            artista: this.artista,
            genero: this.genero,
            arquivo: this.arquivo
          })
        });

        const dados = await resposta.json();
        console.log(dados);

        alert("Música cadastrada com sucesso!");

      } catch (erro) {
        console.error("Erro:", erro);
      }
    }
  }
}
</script>
<template>
  <div>
    <h1>Cadastrar Música</h1>

    <input v-model="titulo" placeholder="Título">
    <input v-model="artista" placeholder="Artista">
    <input v-model="genero" placeholder="Gênero">
    <input v-model="arquivo" placeholder="Arquivo">

    <button @click="cadastrarMusica">
      Cadastrar
    </button>
  </div>
</template>