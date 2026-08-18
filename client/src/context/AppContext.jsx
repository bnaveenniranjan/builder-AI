// this page will redirect the user to login pages ,
//  if new user push sign up pages

import { createContext, useContext } from "react";


const AppContext =  createContext(undefined);

export function AppContentProvider({children}){
     
    // Auth states( giving access to all user)
    const [user,setUser] = useState(null)
    const [loadingUser, setLoading] = useState(true);


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