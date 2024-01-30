const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "your_username",
  host: "your_host",
  database: "your_database",
  password: "your_password",
  port: 5432,
});

const jwt = require("jsonwebtoken");

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

const users = [];

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.sendStatus(400);
  }
  const user = { username, password };
  users.push(user);
  res.sendStatus(201);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.sendStatus(401);
  }
  const accessToken = generateAccessToken({ username: user.username });
  res.json({ accessToken });
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get("/posts", authenticateToken, (req, res) => {
  pool.query("SELECT * FROM posts ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

app.get("/posts/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  pool.query("SELECT * FROM posts WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).json(results.rows);
  });
});

app.post("/posts", authenticateToken, (req, res) => {
  const { title, content, author } = req.body;
  pool.query(
    "INSERT INTO posts (title, content, author) VALUES ($1, $2, $3)",
    [title, content, author],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(201).send(`Post added with ID: ${results.insertId}`);
    }
  );
});

app.put("/posts/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content, author } = req.body;
  pool.query(
    "UPDATE posts SET title = $1, content = $2, author = $3 WHERE id = $4",
    [title, content, author, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      res.status(200).send(`Post modified with ID: ${id}`);
    }
  );
});

app.delete("/posts/:id", authenticateToken, (req, res) => {
  const id = parseInt(req.params.id);
  pool.query("DELETE FROM posts WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    res.status(200).send(`Post deleted with ID: ${id}`);
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images only!");
    }
  },
}).single("image");

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.sendStatus(400);
    } else {
      console.log(req.file);
      res.sendStatus(200);
    }
  });
});

const fs = require("fs");
const crypto = require("crypto");

const encrypt = (buffer) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    process.env.ENCRYPTION_ALGORITHM,
    process.env.ENCRYPTION_KEY,
    iv
  );
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result.toString("base64");
};

const decrypt = (encrypted) => {
  const buffer = Buffer.from(encrypted, "base64");
  const iv = buffer.slice(0, 16);
  const data = buffer.slice(16);
  const decipher = crypto.createDecipheriv(
    process.env.ENCRYPTION_ALGORITHM,
    process.env.ENCRYPTION_KEY,
    iv
  );
  const result = Buffer.concat([decipher.update(data), decipher.final()]);
  return result;
};

const storeFile = (file) => {
  const buffer = fs.readFileSync(file.path);
  const encrypted = encrypt(buffer);
  fs.writeFileSync(`uploads/${file.filename}`, encrypted);
  fs.unlinkSync(file.path);
};

const retrieveFile = (filename) => {
  const encrypted = fs.readFileSync(`uploads/${filename}`);
  const buffer = decrypt(encrypted);
  return buffer;
};
