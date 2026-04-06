import { createWebHistory, createRouter } from "vue-router";

const router = createRouter({
    history: createWebHistory(),
    routes:[
        {
            path: "/login",
            name:"rotaLogin",
            component: () => import("../view/rotaLogin.vue"),
            meta: { title: "Login" }
        },
        {
            path: "/cadastro",
            component: () => import("../view/rotaCadastro.vue"),
            meta: { title: "Cadastro" }
        },
        {
            path: "/",
            redirect: "/home",
        },
        {
            path: "/home",
            component: () => import("../view/rotaHome.vue"),
            meta: { title: "Home" }
        },
        {
            path: "/music",
            component: () => import("../view/rotaMusic.vue"),
            meta: { title: "Music"}
        },
        {
            path: "/perfil",
            component: () => import("../view/rotaPerfil.vue"),
            meta: {title: "Perfil"}
        },
        {
            path: "/musicas",
            component: () => import("../view/DB/cadastrodb.vue")
        }
    ]
})

// 👇 ISSO AQUI FAZ MUDAR O NOME AUTOMATICAMENTE
router.beforeEach((to, from, next) => {
    document.title = to.meta.title || "Meu Site";
    next();
});

export default router;