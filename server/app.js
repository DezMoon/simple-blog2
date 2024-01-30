const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://moongachiku:nUjgdnPMTBEX4ZaW@blog.kabxvsi.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
});

const Post = mongoose.model("Post", postSchema);

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

app.get("/posts", authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find().exec();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/posts/:id", authenticateToken, async (req, res) => {
  const id = req.params.id;
  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      res.status(404).json({ error: "Post not found" });
    } else {
      res.status(200).json(post);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/posts", authenticateToken, async (req, res) => {
  const { title, content, author } = req.body;
  const newPost = new Post({ title, content, author });
  try {
    await newPost.save();
    res.status(201).send(`Post added with ID: ${newPost._id}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
