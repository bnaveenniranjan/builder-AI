import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleWare.js";
import {
    createProject,
    listProjects,
    getProject,
    updateProjectFiles,
    deleteProject,
    publishProject,
} from "../controllers/projectController.js";
import { chat } from "../controllers/chatController.js";
const projectRouter = Router();

// All project routes require authentication
projectRouter.use(authMiddleware);

projectRouter.post("/",                   createProject);
projectRouter.get("/",                    listProjects);
projectRouter.get("/:id",                 getProject);
projectRouter.put("/:id/files",           updateProjectFiles);
projectRouter.delete("/:id",              deleteProject);
projectRouter.post("/:id/publish",        publishProject);

//chat
projectRouter.post("/:id/chat",chat)
export default projectRouter;
