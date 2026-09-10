import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock mongoose Project model ───────────────────────────────────────────────
vi.mock("../models/Project.js", () => {
    const mockProject = {
        _id:       "proj123",
        name:      "Test Project",
        owner:     "user123",
        files:     {},
        version:   0,
        published: false,
        status:    "pending",
        save:      vi.fn().mockResolvedValue(undefined),
        deleteOne: vi.fn().mockResolvedValue(undefined),
    };

    return {
        Project: {
            create:            vi.fn(),
            find:              vi.fn(),
            findById:          vi.fn(),
            findByIdAndUpdate: vi.fn(),
        },
        __mockProject: mockProject,
    };
});

import { Project, __mockProject } from "../models/Project.js";
import {
    createProject,
    listProjects,
    getProject,
    updateProjectFiles,
    deleteProject,
    publishProject,
} from "../controllers/projectController.js";

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal Express-style req object */
function mockReq(overrides = {}) {
    return {
        user:   { userId: "user123" },
        params: {},
        body:   {},
        ...overrides,
    };
}

/** Build a mock res with chainable status().json() */
function mockRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json   = vi.fn().mockReturnValue(res);
    return res;
}

function freshProject(overrides = {}) {
    return {
        ...__mockProject,
        owner:    { toString: () => "user123" },
        save:     vi.fn().mockResolvedValue(undefined),
        deleteOne: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
// createProject
// ══════════════════════════════════════════════════════════════════════════════
describe("createProject", () => {
    it("creates a project and returns 201 when prompt is provided", async () => {
        const project = freshProject();
        Project.create.mockResolvedValue(project);
        Project.findByIdAndUpdate.mockResolvedValue(project);

        const req = mockReq({ body: { prompt: "Build a todo app", name: "Todo App" } });
        const res = mockRes();

        await createProject(req, res);

        expect(Project.create).toHaveBeenCalledWith(
            expect.objectContaining({ owner: "user123", name: "Todo App" })
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ project });
    });

    it("returns 400 when prompt is missing", async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();

        await createProject(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "prompt is required" });
        expect(Project.create).not.toHaveBeenCalled();
    });

    it("uses 'Untitled project' when name is not provided", async () => {
        const project = freshProject();
        Project.create.mockResolvedValue(project);
        Project.findByIdAndUpdate.mockResolvedValue(project);

        const req = mockReq({ body: { prompt: "Build something" } });
        const res = mockRes();

        await createProject(req, res);

        expect(Project.create).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Untitled project" })
        );
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// listProjects
// ══════════════════════════════════════════════════════════════════════════════
describe("listProjects", () => {
    it("returns all projects for authenticated user", async () => {
        const projects = [freshProject(), freshProject({ _id: "proj456" })];
        const selectMock = vi.fn().mockReturnThis();
        const sortMock   = vi.fn().mockResolvedValue(projects);
        Project.find.mockReturnValue({ select: selectMock, sort: sortMock });

        const req = mockReq();
        const res = mockRes();

        await listProjects(req, res);

        expect(Project.find).toHaveBeenCalledWith({ owner: "user123" });
        expect(res.json).toHaveBeenCalledWith({ projects });
    });

    it("returns empty array when user has no projects", async () => {
        const selectMock = vi.fn().mockReturnThis();
        const sortMock   = vi.fn().mockResolvedValue([]);
        Project.find.mockReturnValue({ select: selectMock, sort: sortMock });

        const req = mockReq();
        const res = mockRes();

        await listProjects(req, res);

        expect(res.json).toHaveBeenCalledWith({ projects: [] });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// getProject
// ══════════════════════════════════════════════════════════════════════════════
describe("getProject", () => {
    it("returns full project for the owner", async () => {
        const project = freshProject();
        Project.findById.mockResolvedValue(project);

        const req = mockReq({ params: { id: "proj123" } });
        const res = mockRes();

        await getProject(req, res);

        expect(res.json).toHaveBeenCalledWith({ project });
    });

    it("returns 404 when project not found", async () => {
        Project.findById.mockResolvedValue(null);

        const req = mockReq({ params: { id: "nonexistent" } });
        const res = mockRes();

        await getProject(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Project not found" });
    });

    it("returns 403 when requester is not the owner", async () => {
        const project = freshProject({ owner: { toString: () => "otherUser" } });
        Project.findById.mockResolvedValue(project);

        const req = mockReq({ params: { id: "proj123" } });
        const res = mockRes();

        await getProject(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "Access denied" });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// updateProjectFiles
// ══════════════════════════════════════════════════════════════════════════════
describe("updateProjectFiles", () => {
    it("merges and saves files, increments version", async () => {
        const project = freshProject({ files: { "old.js": "old content" }, version: 1 });
        Project.findById.mockResolvedValue(project);

        const req = mockReq({
            params: { id: "proj123" },
            body:   { files: { "new.js": "new content" } },
        });
        const res = mockRes();

        await updateProjectFiles(req, res);

        expect(project.files).toEqual({ "old.js": "old content", "new.js": "new content" });
        expect(project.version).toBe(2);
        expect(project.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ project });
    });

    it("returns 400 when files is missing", async () => {
        const req = mockReq({ params: { id: "proj123" }, body: {} });
        const res = mockRes();

        await updateProjectFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "files object is required" });
    });

    it("returns 404 when project not found", async () => {
        Project.findById.mockResolvedValue(null);

        const req = mockReq({ params: { id: "xyz" }, body: { files: {} } });
        const res = mockRes();

        await updateProjectFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 403 when requester is not the owner", async () => {
        const project = freshProject({ owner: { toString: () => "otherUser" } });
        Project.findById.mockResolvedValue(project);

        const req = mockReq({ params: { id: "proj123" }, body: { files: { "a.js": "" } } });
        const res = mockRes();

        await updateProjectFiles(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// deleteProject
// ══════════════════════════════════════════════════════════════════════════════
describe("deleteProject", () => {
    it("deletes project and returns success", async () => {
        const project = freshProject();
        Project.findById.mockResolvedValue(project);

        const req = mockReq({ params: { id: "proj123" } });
        const res = mockRes();

        await deleteProject(req, res);

        expect(project.deleteOne).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ success: true, message: "Project deleted" });
    });

    it("returns 404 when project not found", async () => {
        Project.findById.mockResolvedValue(null);

        const req = mockReq({ params: { id: "nonexistent" } });
        const res = mockRes();

        await deleteProject(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Project not found" });
    });

    it("returns 403 when requester is not the owner", async () => {
        const project = freshProject({ owner: { toString: () => "otherUser" } });
        Project.findById.mockResolvedValue(project);

        const req = mockReq({ params: { id: "proj123" } });
        const res = mockRes();

        await deleteProject(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(project.deleteOne).not.toHaveBeenCalled();
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// publishProject
// ══════════════════════════════════════════════════════════════════════════════
describe("publishProject", () => {
    it("sets published to true and saves", async () => {
        const project = freshProject({ published: false });
        Project.findById.mockResolvedValue(project);

        const req = mockReq({ params: { id: "proj123" }, body: { published: true } });
        const res = mockRes();

        await publishProject(req, res);

        expect(project.published).toBe(true);
        expect(project.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ project });
    });

    it("sets published to false (unpublish)", async () => {
        const project = freshProject({ published: true });
        Project.findById.mockResolvedValue(project);

        const req = mockReq({ params: { id: "proj123" }, body: { published: false } });
        const res = mockRes();

        await publishProject(req, res);

        expect(project.published).toBe(false);
        expect(project.save).toHaveBeenCalled();
    });

    it("returns 400 when published field is missing", async () => {
        const req = mockReq({ params: { id: "proj123" }, body: {} });
        const res = mockRes();

        await publishProject(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "published (boolean) is required" });
    });

    it("returns 400 when published is not a boolean", async () => {
        const req = mockReq({ params: { id: "proj123" }, body: { published: "yes" } });
        const res = mockRes();

        await publishProject(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 404 when project not found", async () => {
        Project.findById.mockResolvedValue(null);

        const req = mockReq({ params: { id: "nonexistent" }, body: { published: true } });
        const res = mockRes();

        await publishProject(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("returns 403 when requester is not the owner", async () => {
        const project = freshProject({ owner: { toString: () => "otherUser" } });
        Project.findById.mockResolvedValue(project);

        const req = mockReq({ params: { id: "proj123" }, body: { published: true } });
        const res = mockRes();

        await publishProject(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(project.save).not.toHaveBeenCalled();
    });
});
