
// ================= IMPORTS =================
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

// ================= CONFIG =================
app.use(cors());
app.use(express.json());

// ================= PORTA =================
const PORT = process.env.PORT || 3000;

// ================= UPLOAD =================
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

app.use("/uploads", express.static(uploadPath));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// ================= MYSQL =================
// Crie arquivo .env com:
//
// DB_HOST=localhost
// DB_USER=root
// DB_PASSWORD=
// DB_NAME=musica_app
// PORT=3000

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "spotfree",
    waitForConnections: true,
    connectionLimit: 10
});

// TESTAR CONEXÃO
db.getConnection((err, conn) => {
    if (err) {
        console.log("❌ Erro ao conectar MySQL:");
        console.log(err.message);
    } else {
        console.log("✅ Banco MySQL conectado!");
        conn.release();
    }
});

// ================= ROTAS TESTE =================
app.get("/", (req, res) => {
    res.send("API rodando 🚀");
});

app.get("/teste-db", (req, res) => {
    db.query("SELECT 1", (err) => {
        if (err) {
            return res.status(500).json({
                erro: "Erro no banco",
                detalhe: err.message
            });
        }

        res.send("Banco conectado ✅");
    });
});

// ================= MUSICAS =================

// LISTAR
app.get("/musicas", (req, res) => {
    db.query("SELECT * FROM musicas ORDER BY id DESC", (err, result) => {
        if (err) {
            return res.status(500).json({
                erro: err.message
            });
        }

        res.json(result);
    });
});

// CADASTRAR
app.post(
    "/musicas",
    upload.fields([
        { name: "imagem", maxCount: 1 },
        { name: "audio", maxCount: 1 }
    ]),
    (req, res) => {

        const { titulo, artista } = req.body;

        if (!titulo || !artista) {
            return res.status(400).json({
                erro: "Título e artista obrigatórios"
            });
        }

        const imagem = req.files?.imagem?.[0]?.filename || null;
        const audio = req.files?.audio?.[0]?.filename || null;

        db.query(
            "INSERT INTO musicas (titulo, artista, imagem, audio) VALUES (?, ?, ?, ?)",
            [titulo, artista, imagem, audio],
            (err) => {
                if (err) {
                    return res.status(500).json({
                        erro: err.message
                    });
                }

                res.json({ ok: true });
            }
        );
    }
);

// DELETAR
app.delete("/musicas/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM musicas WHERE id=?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    erro: err.message
                });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    erro: "Música não encontrada"
                });
            }

            const musica = result[0];

            if (musica.imagem) {
                const img = path.join(uploadPath, musica.imagem);

                if (fs.existsSync(img)) {
                    fs.unlinkSync(img);
                }
            }

            if (musica.audio) {
                const aud = path.join(uploadPath, musica.audio);

                if (fs.existsSync(aud)) {
                    fs.unlinkSync(aud);
                }
            }

            db.query(
                "DELETE FROM musicas WHERE id=?",
                [id],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            erro: err.message
                        });
                    }

                    res.json({ ok: true });
                }
            );
        }
    );
});

// ================= REGISTER =================
app.post("/register", async (req, res) => {

    try {
        const {
            nome,
            email,
            senha,
            confirmarSenha,
            data_nascimento
        } = req.body;

        if (!nome || !email || !senha || !confirmarSenha || !data_nascimento) {
            return res.status(400).json({
                erro: "Preencha todos os campos"
            });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).json({
                erro: "Senhas diferentes"
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        db.query(
            "INSERT INTO usuarios (nome,email,senha,data_nascimento) VALUES (?,?,?,?)",
            [nome, email, senhaHash, data_nascimento],
            (err) => {

                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({
                            erro: "Email já cadastrado"
                        });
                    }

                    return res.status(500).json({
                        erro: err.message
                    });
                }

                res.json({ ok: true });
            }
        );

    } catch {
        res.status(500).json({
            erro: "Erro interno"
        });
    }
});

// ================= LOGIN =================
app.post("/login", (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            erro: "Preencha email e senha"
        });
    }

    db.query(
        "SELECT * FROM usuarios WHERE email=?",
        [email],
        async (err, result) => {

            if (err) {
                return res.status(500).json({
                    erro: err.message
                });
            }

            if (result.length === 0) {
                return res.status(400).json({
                    erro: "Usuário não encontrado"
                });
            }

            const usuario = result[0];

            const senhaOk = await bcrypt.compare(
                senha,
                usuario.senha
            );

            if (!senhaOk) {
                return res.status(400).json({
                    erro: "Senha incorreta"
                });
            }

            res.json({
                ok: true,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                }
            });
        }
    );
});

// ================= START =================
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});