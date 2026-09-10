import { Project } from "../models/Project.js";

// ─── Private Helper ────────────────────────────────────────────────────────────

/**
 * Background worker — progressive AI file generation.
 * Runs fire-and-forget after createProject responds.
 * @param {string} projectId
 * @param {string} prompt
 */
async function runBackgroundGeneration(projectId, prompt) {
    try {
        await Project.findByIdAndUpdate(projectId, { status: "generating" });

        // TODO: integrate AI generation pipeline here
        // e.g. call OpenAI / Gemini, stream files back, update project.files

        await Project.findByIdAndUpdate(projectId, { status: "completed" });
    } catch (err) {
        await Project.findByIdAndUpdate(projectId, {
            status: "failed",
            error: err.message,
        });
    }
}

// ─── POST /api/projects ────────────────────────────────────────────────────────
/**
 * Create a new project from an AI prompt.
 * Body: { name?, description?, prompt }
 */
export async function createProject(req, res) {
    const { name, description, prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "prompt is required" });
    }

    const project = await Project.create({
        name:        name?.trim() || "Untitled project",
        description: description?.trim() || "",
        owner:       req.user.userId,
        status:      "pending",
    });

    // Kick off generation without blocking the response
    runBackgroundGeneration(project._id.toString(), prompt);

    return res.status(201).json({ project });
}

// ─── GET /api/projects ─────────────────────────────────────────────────────────
/**
 * List all projects owned by the authenticated user.
 * Returns summary fields only — no file contents.
 */
export async function listProjects(req, res) {
    const projects = await Project.find({ owner: req.user.userId })
        .select("-files -messages")
        .sort({ updatedAt: -1 });

    return res.json({ projects });
}

// ─── GET /api/projects/:id ─────────────────────────────────────────────────────
/**
 * Get full project details (ownership-gated).
 */
export async function getProject(req, res) {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).json({ error: "Project not found" });
    }

    if (project.owner.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
    }

    return res.json({ project });
}

// ─── PUT /api/projects/:id/files ───────────────────────────────────────────────
/**
 * Update project files (manual edits from the editor).
 * Body: { files: { "path/to/file.js": "...content..." } }
 */
export async function updateProjectFiles(req, res) {
    const { files } = req.body;

    if (!files || typeof files !== "object") {
        return res.status(400).json({ error: "files object is required" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).json({ error: "Project not found" });
    }

    if (project.owner.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
    }

    project.files   = { ...project.files, ...files };
    project.version += 1;
    await project.save();

    return res.json({ project });
}

// ─── DELETE /api/projects/:id ──────────────────────────────────────────────────
/**
 * Delete a project (ownership-gated).
 */
export async function deleteProject(req, res) {
    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).json({ error: "Project not found" });
    }

    if (project.owner.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
    }

    await project.deleteOne();

    return res.json({ success: true, message: "Project deleted" });
}

// ─── POST /api/projects/:id/publish ───────────────────────────────────────────
/**
 * Toggle the published flag on a project.
 * Body: { published: true | false }
 */
export async function publishProject(req, res) {
    const { published } = req.body;

    if (typeof published !== "boolean") {
        return res.status(400).json({ error: "published (boolean) is required" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
        return res.status(404).json({ error: "Project not found" });
    }

    if (project.owner.toString() !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
    }

    project.published = published;
    await project.save();

    return res.json({ project });
}