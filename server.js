import express from "express";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = "training_secret";

/* -------------------- In-memory data -------------------- */

const users = [
  {
    id: "1",
    email: "admin@test.com",
    password: "password123",
    role: "admin",
    isActive: true
  },
  {
    id: "2",
    email: "user@test.com",
    password: "password123",
    role: "user",
    isActive: true
  }
];

/* -------------------- Helpers -------------------- */

function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = header.replace("Bearer ", "");
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

/* -------------------- AUTH -------------------- */

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    accessToken: generateToken(user)
  });
});

/* -------------------- USERS -------------------- */

/**
 * GET /users
 * ?page=1&limit=5&role=admin&isActive=true
 */
app.get("/users", authMiddleware, (req, res) => {
  let result = [...users];

  if (req.query.role) {
    result = result.filter(u => u.role === req.query.role);
  }

  if (req.query.isActive) {
    result = result.filter(
      u => String(u.isActive) === req.query.isActive
    );
  }

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 5);
  const start = (page - 1) * limit;
  const end = start + limit;

  res.json({
    data: result.slice(start, end),
    meta: {
      total: result.length,
      page,
      limit
    }
  });
});

/* GET /users/:id */
app.get("/users/:id", authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});

/* POST /users (admin only) */
app.post("/users", authMiddleware, adminOnly, (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: "email and role required" });
  }

  const newUser = {
    id: uuid(),
    email,
    password: "password123",
    role,
    isActive: true
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

/* PATCH /users/:id */
app.patch("/users/:id", authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (req.user.role !== "admin" && req.user.id !== user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  Object.assign(user, req.body);
  res.json(user);
});

/* DELETE /users/:id (admin only) */
app.delete("/users/:id", authMiddleware, adminOnly, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  users.splice(index, 1);
  res.status(204).send();
});

/* -------------------- ERROR SIMULATION -------------------- */

app.get("/error/500", (req, res) => {
  res.status(500).json({ message: "Simulated server error" });
});

/* -------------------- START -------------------- */

app.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});

