// this page will redirect the user to login pages ,
//  if new user push sign up pages

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/api";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AppContext =  createContext(undefined);

export function AppContentProvider({children}){
     
    const navigate = useNavigate()
    // Auth states( giving access to all user)
    const [user,setUser] = useState(null)
    const [loadingUser, setLoading] = useState(true);

    //states
    const [projects, setProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);
    const [activeProject, setActiveProject] = useState(null);
    const [loadingActiveProject, setLoadingActiveProject] = useState(true);
    const [chatLoading, setChatLoading] = useState(false);
    const [generatingProject, setGeneratingProject] = useState(false);
    const [activeFile, setActiveFile] = useState("/App.js");
    const [showCode, setShowCode] = useState(false);


    // Auth Actions
    const checkSession = async ()=>{
        try{
            const {data} = await api.get("/api/auth/me");
            setUser(data.user);
        }catch (error){
            setUser(null)
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        checkSession()
        },[])

   

    const login = async (email,password) => {
        try{
            const {data} = await api.post("/api/auth/login",{email, password});
            setUser(data.user)
            toast.success("Welcome back!")
            navigate("/")
        }catch (err) {
            console.error("login failed:",err);
            const errMsg = err?.response?.data?.error || "Invalid email or password";
            toast.error(errMsg);
            throw new Error(errMsg);
        }

    } 
    const register = async (name,email,password) => {
        try{
            const {data} = await api.post("/api/auth/register",{name,email,password});
            setUser(data.user)
            toast.success("Account created successfully!")
            navigate("/")
        }catch(err){
            console.error("Registration failed:",err);
            const errMsg = err?.response?.data?.error || "Registration failed";
            toast.error(errMsg);
            throw new Error(errMsg);
        }
    }  

    const logout = async ()=>{
        try{
            await api.post("/api/auth/logout")
            setUser(null)
            setProjects([])
            setActiveProject(null)
            toast.success("Logged out successfully")
            navigate("/login")
        }catch(error){
            console.error("Logout failed:",error);
            toast.error("Logout failed");
        }
    }

// projects access and action (implementing the try catch funtion )
const loadProjects = async () => {
    if(!user) return ;
    try{
        const {data} = await api.get("/api/projects")
        setProjects(data)
    }catch (err){
        console.error("failed to list projects:" ,err);
        toast.error("Failed to load projects list");
    }finally{
        setLoadingProjects(false);

    }
    }
// to load individual projects in page
    const loadProject = async(id,silent = false ) =>{
        if(!user) return;
        if(!silent) setLoadingActiveProject(true)
            try{
                const {data} = await api.get(`/api/projects/${id}`)
                setActiveProject(data);

            const files = Object.keys(data.files || {});
            if(files.length > 0){
                setActiveFile((prev)=>{
                    if(files.includes(prev)) return prev;
                    if(files.includes("/App.js")) return "/App.js";
                    return files[0]

                })
            }
            }catch(error){
                console.error("failed to load projects:",error);
                if(!silent){
                    toast.error("failed to load project details");
                    navigate("/");
                }
            }finally{
                    if(!silent) setLoadingActiveProject(false)
                }

            }
        //Automatically poll active project status if generating or pending
        useEffect(()=>{
            if(!activeProject?._id || !user) return;

            const isOngoing = activeProject.status === "generating" || activeProject.status === "pending" || activeProject.status ==="revising";

            if(isOngoing){
                setChatLoading(true);
                const interval = setInterval(()=>{
                    loadProject(activeProject._id,true)
                },2000);
                return ()=> clearInterval(interval)
            }else{
                setChatLoading(false);
            }
            
        
            },[activeProject?._id,activeProject?.status,user])

            const handleGenerate = useCallback(
                async(prompt) => {
                    if(!user) return;
                    setGeneratingProject(true);
                    try{
                        const {data} = await api.post("/api/projects",{prompt});
                        toast.success("AI Agent is planning structure...")
                        navigate(`/builder/${data._id}`);

                    }catch(error){
                        console.error("Failed to generate projects:",error);
                        toast.error(error?.response?.data?.error || "failed to generate projects");
                    }finally{
                        setGeneratingProject(false);
                    }     
                        
                    },[navigate,user]
                )
                
                const handleDelete = useCallback(
                async(id) => {
                    if(!user) return;
                    
                    try{
                        await api.delete(`/api/projects/${id}`);
                        setProjects((prev)=>prev.filter((p)=>p._id !== id))
                        toast.success("Project deleted successfully")
                    }catch(error){
                        console.error("Failed to delete project:",error);
                        toast.error("failed to delete project");
                    }
                        
                    },[user]
                )
            

        return(
            <AppContext.Provider value={{
                user,
                loadingUser,
                login,
                register,
                logout,
                projects,
                loadingProjects,
                loadingprojects: loadingProjects,
                activeProject,
                activeProjects: activeProject,
                loadingActiveProject,
                loadingActiveProjects: loadingActiveProject,
                activeFile,
                showCode,
                showcode: showCode,
                generatingProject,
                generatingProjects: generatingProject,
                chatLoading,
                setActiveFile,
                setShowCode,
                loadProjects,
                loadProject,
                handleGenerate,
                handlegenerate: handleGenerate,
                handleDelete,
                handledelete: handleDelete

            }}>
                {children}
            </AppContext.Provider>
        )
    }
    


export function useAppContext(){
    const context = useContext(AppContext);
    if(context === undefined){
        throw new Error("useAppContext must be used within an AppContentProvider");

    }
    return context;
}