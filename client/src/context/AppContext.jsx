// this page will redirect the user to login pages ,
//  if new user push sign up pages

import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AppContext =  createContext(undefined);

export function AppContentProvider({children}){
     
    // Auth states( giving access to all user)
    const [user,setUser] = useState(null)
    const [loadingUser, setLoading] = useState(true);

    // Auth Actions
    const checkSession = async ()=>{
        try{
            const {data} = await api.get("/api/auth/me");
          //  setUser(data.user);
        }catch (error){
            setUser(null)
        }finally{
            setLoading(false)
        }
    }
    useEffect(()=>{
        checkSession()

    },[checkSession])

    return(
        <AppContext.Provider value={{
            user,
            loadingUser
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