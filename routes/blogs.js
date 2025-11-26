import { Router } from "express";
import { body, validationResult } from "express-validator";
import slugify from "slugify";
import xss from "xss";
import db from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import logger from "../utils/logger.js";

const r = Router();

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

// GET /api/blogs  -> list all blogs
r.get("/", async (req, res) => {
  try {
    const blogs = await db.Blog.findAll({
      include: [
        {
          model: db.User,
          attributes: [
            "id",
            "firstName",
            "lastName",
            "eduEmail"
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json({ blogs });
  } catch (e) {
    logger.error("GET /api/blogs failed:", e?.parent?.sqlMessage || e.message);
    res.status(500).json({ message: "Failed to load blogs" });
  }
});

// GET /api/blogs/:slug -> get one by slug
r.get("/:slug", async (req, res) => {
  const blog = await db.Blog.findOne({
    where: { slug: req.params.slug },
    include: [
      {
        model: db.User,
        attributes: [
          "id",
          "firstName",
          "lastName",
          "eduEmail"
        ]
      }
    ]
  });
  if (!blog) return res.status(404).json({ message: "Not found" });
  res.json({ blog });
});

// POST /api/blogs  -> create (admin only)
r.post(
  "/",
  requireAuth,
  requireRole("admin"),
  validate([
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
    body("coverImageUrl").optional().isString()
  ]),
  async (req, res) => {
    try {
      const { title, content, coverImageUrl } = req.body;

      const slug = slugify(title, { lower: true, strict: true });

      // Ensure slug is unique
      const existing = await db.Blog.findOne({ where: { slug } });
      if (existing) {
        return res.status(409).json({ message: "A blog with this title already exists" });
      }

      const blog = await db.Blog.create({
        title: xss(title),
        slug,
        content: xss(content),
        coverImageUrl: coverImageUrl ? xss(coverImageUrl) : null,
        authorId: req.user.id
      });

      res.status(201).json({ blog });
    } catch (e) {
      logger.error("Blog creation error:", e);
      res.status(500).json({ message: "Failed to create blog" });
    }
  }
);

// PUT /api/blogs/:id -> update (admin only)
r.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  validate([
    body("title").optional().isString(),
    body("content").optional().isString(),
    body("coverImageUrl").optional().isString()
  ]),
  async (req, res) => {
    try {
      const blog = await db.Blog.findByPk(req.params.id);
      if (!blog) return res.status(404).json({ message: "Not found" });

      const data = {};
      if (req.body.title) {
        data.title = xss(req.body.title);
        data.slug = slugify(req.body.title, { lower: true, strict: true });
        // Optional: check for slug conflicts
        const other = await db.Blog.findOne({
          where: { slug: data.slug, id: { [db.Sequelize.Op.ne]: blog.id } }
        });
        if (other) {
          return res.status(409).json({ message: "Another blog already has this title" });
        }
      }
      if (req.body.content) data.content = xss(req.body.content);
      if (req.body.coverImageUrl) data.coverImageUrl = xss(req.body.coverImageUrl);

      await blog.update(data);
      res.json({ blog });
    } catch (e) {
      logger.error("Blog update error:", e);
      res.status(500).json({ message: "Failed to update blog" });
    }
  }
);

// DELETE /api/blogs/:id -> delete (admin only)
r.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const blog = await db.Blog.findByPk(req.params.id);
  if (!blog) return res.status(404).json({ message: "Not found" });
  await blog.destroy();
  res.json({ ok: true });
});

export default r;
