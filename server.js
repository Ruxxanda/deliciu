const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const db = new sqlite3.Database("baza.db");

// Creare tabel mesaje dacă nu există
db.run(`CREATE TABLE IF NOT EXISTS mesaje (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT,
  userName TEXT,
  userPhoto TEXT,
  text TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(cors({
  origin: "http://localhost:5500",
  credentials: true
}));

app.use(session({
  secret: "secretul-meu",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());

// 🔐 Autentificare Google
passport.use(new GoogleStrategy({
  clientID: "677376092677-8dcfs8vhj6fml35a18ui1ngp8plihqsk.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: "http://localhost:3000/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    name: profile.displayName,
    photo: profile.photos[0].value
  };
  return done(null, user);


  (profile, done) => {
  console.log("PROFILE GOOGLE:", profile);
  const user = {
    id: profile.id,
    name: profile.displayName,
    photo: profile.photos?.[0]?.value || null
  };
  return done(null, user);
}

}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// 🔐 Rute login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));
app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => res.redirect("http://localhost:5500/index.html")
);

// 📄 Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:5500/index.html");
  });
});

// 👤 Profil user logat
app.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Neautorizat" });
  res.json(req.user);
});

// 📩 Adaugă mesaj
app.post("/messages", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Neautorizat" });
  const { text } = req.body;
  const { id, name, photo } = req.user;
  db.run(`INSERT INTO mesaje (userId, userName, userPhoto, text) VALUES (?, ?, ?, ?)`,
    [id, name, photo, text], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    });
});

// 📥 Afișează toate mesajele
app.get("/messages", (req, res) => {
  db.all(`SELECT * FROM mesaje ORDER BY timestamp DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


// 🧽 Șterge mesaj (doar dacă e al userului)
app.delete("/messages/:id", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Neautorizat" });
  const idMesaj = req.params.id;
  const userId = req.user.id;
  db.run(`DELETE FROM mesaje WHERE id = ? AND userId = ?`, [idMesaj, userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: this.changes > 0 });
  });
});

// ✏️ Editează mesaj (doar dacă e al userului)
app.put("/messages/:id", (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Neautorizat" });
  const idMesaj = req.params.id;
  const { text } = req.body;
  const userId = req.user.id;
  db.run(`UPDATE mesaje SET text = ? WHERE id = ? AND userId = ?`, [text, idMesaj, userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: this.changes > 0 });
  });
});

// Pornire server
app.listen(3000, () => {
  console.log("Server pornit pe http://localhost:3000");
});
