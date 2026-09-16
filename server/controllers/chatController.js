import {Project} from "../models/Project.js";
import { reviseProject } from "../services/ai";
import { applyOperations } from "../services/diff.js";

export function buildManifest(files){
    const manifest = [];
    for(const [path,entry] of Object.entries(files)){
        manifest.push({path,hash:entry.hash,size:entry.content.length})
    }
    return manifest;
}
//POST /API/PROJECTS/:ID/CHAT

//send a revision prompt and return updates project.

export async function chat(req,res){
    const{prompt} = req.body;

    if(!prompt || typeof prompt !== "string"){
        res.status(400).json({error:"prompt is required"});
        return ;
    }
    if(!req.user){
        res.status(401).json({error:"unauthorized"});
        return;
    }
    const project = await Project.findone({_id:req.params.id,owner:req.user.userId});

    if(!project){
        res.status(404).json({error : "Project not found"});
        return;
    }

    // Set status to revising and save user prompt immediately
    project.status = "revising",
    project.messages.push({role :"user",content:prompt,timestamp:new Date()});
    await project.save();

    try{
        // build campact manifest (path + hash + size ) instead of sending all code
        const manifest = buildManifest(project.files);
        // Include ALL file contents so the AI can do accurate serach / replace
        const relevantFiles = {};
        for(const[path,entry]of Object.entries(project.files)){
            relevantFiles[path] = entry.content;
        }
        //Recent message for context(last 4 max)
        const recentMessages = project.message.slice(-4).map((m)=>({
            role:m.role,
            content:m.content,

        }))

        console.log(
            `[AI] Revising project ${project._id}: "${prompt.slice(0,80)}..."` +
            `(${manifest.length} files,manifest ~ ${JSON.stringify(manifest).length}chars)`,
        );

        // call AI with manifest + relevant files
        const result = await reviseProject(prompt,manifest,relevantFiles,recentMessages)

        console.log(`[AI] got ${result.opration.length} operation :${result.description}`);

        //Apply opreations to file map 
        const {files : updateFiles , applied,errors } = applyOperations(project.files, result.operations)

        if(errors.length > 0){
            console.warn(`[Diff] Errors applying operations:`,errors);
        }
        // Update project in DB
        project.files = updateFiles;
        project.markModified('files');
        project.version += 1;
        project.status = "completed";
        project.message.push({
            role:"assistant",
            content:result.description +(errors.length > 0 ? `\n\n Some operation failed: ${errors.join(",")}`:""),

        })
        await project.save();
        // return updated project
        const filesObj = {};
        for(const [path,entry] of Object.entries(project.files)){
            filesObj[path] = entry.content;
        }
        res.json({
            _id:project._id,
            name:project.name,
            description : project.description,
            files:filesObj,
            message: project.messages,
            version:project.version,
            status:project.status,
            applied,
            errors,
            aiDescription:result.description,



        })
    } catch(error){
        console.error(`[AI Revision Error] ${error.message}`);
        project.status = "completed";
        await project.save();
        res.status(500).json({error:err.message || "failed to process revision request"});

    }

}