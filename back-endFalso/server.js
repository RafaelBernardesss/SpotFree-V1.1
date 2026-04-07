
// IMPORTS
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

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

// ================= DB =================
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT) || 3306,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect(err => {
    if (err) {
        console.error("❌ ERRO COMPLETO DB:", err);
    } else {
        console.log("✅ Banco conectado");
    }
});

// ================= TESTE =================
app.get("/", (req, res) => {
    res.send("API rodando 🚀");
});

app.get("/teste-db", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.error("❌ ERRO TESTE DB:", err);
      return res.status(500).json(err);
    }
    res.send("Banco conectado ✅");
  });
});

// ================= MUSICAS =================

// GET
app.get("/musicas", (req, res) => {
    db.query("SELECT * FROM musicas", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// POST
app.post("/musicas",
    upload.fields([
        { name: "imagem", maxCount: 1 },
        { name: "audio", maxCount: 1 }
    ]),
    (req, res) => {

        const { titulo, artista } = req.body;

        const imagem = req.files?.imagem?.[0]?.filename || null;
        const audio = req.files?.audio?.[0]?.filename || null;

        if (!titulo || !artista) {
            return res.status(400).json({ erro: "Título e artista obrigatórios" });
        }

        db.query(
            "INSERT INTO musicas (titulo, artista, imagem, audio) VALUES (?, ?, ?, ?)",
            [titulo, artista, imagem, audio],
            (err) => {
                if (err) return res.status(500).json(err);
                res.json({ ok: true });
            }
        );
    }
);

// DELETE
app.delete("/musicas/:id", (req, res) => {

    db.query("SELECT * FROM musicas WHERE id=?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);

        const musica = result[0];

        if (musica?.imagem) {
            const caminho = path.join(uploadPath, musica.imagem);
            if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
        }

        if (musica?.audio) {
            const caminho = path.join(uploadPath, musica.audio);
            if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
        }

        db.query("DELETE FROM musicas WHERE id=?", [req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ ok: true });
        });
    });
});

// ================= USUÁRIO =================

// REGISTER
app.post("/register", async (req, res) => {
    const { nome, email, senha, confirmarSenha, data_nascimento } = req.body;

    if (!nome || !email || !senha || !confirmarSenha || !data_nascimento) {
        return res.status(400).json({ erro: "Preencha todos os campos" });
    }

    if (senha !== confirmarSenha) {
        return res.status(400).json({ erro: "Senhas não conferem" });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        db.query(
            "INSERT INTO usuarios (nome, email, senha, data_nascimento) VALUES (?, ?, ?, ?)",
            [nome, email, senhaHash, data_nascimento],
            (err) => {
                if (err) {
                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(400).json({ erro: "Email já existe" });
                    }
                    return res.status(500).json(err);
                }

                res.json({ ok: true });
            }
        );

    } catch {
        res.status(500).json({ erro: "Erro ao criptografar senha" });
    }
});

// LOGIN
app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos" });
    }

    db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ erro: "Erro no servidor" });

        if (result.length === 0) {
            return res.status(400).json({ erro: "Email ou senha inválidos" });
        }

        const usuario = result[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(400).json({ erro: "Email ou senha inválidos" });
        }

        res.json({
            ok: true,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                imagem: usuario.imagem || null
            }
        });
    });
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 Servidor rodando na porta", PORT);
});
