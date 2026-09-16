import { Project } from "../models/Project.js";
import { generateProject } from "../services/ai.js";

// ─── Private Helper ────────────────────────────────────────────────────────────

// BackGround worker to progressive generate files and update database in real time.
/**
 * @param {string} projectId
 * @param {string} prompt
 */
async function runBackground(projectId, prompt) {
    try {
        console.log(`[Background AI] Starting generation for project ${projectId}`);

        await Project.findByIdAndUpdate(projectId, { status: "generating" });

        const result = await generateProject(prompt, {
            onPlan: async (plan) => {
                console.log(
                    `[Background AI] Plan created for project ${projectId}. Planned ${plan.files.length} files.`
                );
            },
            onFileStart: async (filePath) => {
                console.log(`[Background AI] Generating file: ${filePath}`);
            },
            onFileComplete: async (filePath, code) => {
                await Project.findByIdAndUpdate(projectId, {
                    $set: { [`files.${filePath.replace(/\//g, "__")}`]: code },
                });
                console.log(`[Background AI] Saved file: ${filePath}`);
            },
        });

        await Project.findByIdAndUpdate(projectId, {
            status: "completed",
            files: result.files,
            description: result.description,
        });

        console.log(`[Background AI] Generation complete for project ${projectId}`);
    } catch (err) {
        console.error(`[Background AI] Generation failed for project ${projectId}:`, err.message);
        await Project.findByIdAndUpdate(projectId, {
            status: "failed",
            error: err.message,
        });
    }
}

// POST /api/projects
// Create a new project from an AI prompt
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
    runBackground(project._id.toString(), prompt);

    return res.status(201).json({ project });
}

// GET /api/projects
// List all projects owned by the user (summary only, no file contents).
export async function listProjects(req, res) {
    const projects = await Project.find({ owner: req.user.userId })
        .select("-files -messages")
        .sort({ updatedAt: -1 });

    return res.json({ projects });
}

// GET /api/projects/:id
// GET full project details.
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

// PUT /api/projects/:id/files
// Update project files (manual edits).
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

// DELETE /api/projects/:id
// Delete a project.
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

//POST/API/PROJECTS/:ID/PUBLISH
//UPDATE PROJECT FILES (publicly published).
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