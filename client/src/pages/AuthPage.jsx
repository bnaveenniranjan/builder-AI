import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import LoginLeft from '../components/loginLeft';
const AuthPage = ({mode}) => {
  const[error,setError] = useState("")
  const [loading , setLoading] = useState(false)
  const [name,setName] = useState("");
  const [email,setemail] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setshowPassword] = useState("");

  const islogin = mode ==="login";
  return (
    <div className="min-h-screen bg-white flex text-zinc-900 font-sans">

      {/*left Panel - Branding*/}
      <LoginLeft/>

      {/* Right Panel - Form*/}
      <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">

        <div className=" mb-10">
          <h1 className="text-3xl font-medium tracking-tight text-zinc-900 mb-1.5 font-sans">{islogin ? "Sign in" : "Create an account"}</h1>
          <p className='text-sm text-zinc-400'>
            {islogin ? "enter your credentials to access your website builder.":"Get started by entering your registration details."}
          </p>
        </div>
      {error && <div className='mb-6 p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded'>{error}</div>}

      <form className ='space-y-6'>
        {!islogin &&(
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
              Full Name
            </label>
          <input type="text" value ={name} onChange={(e)=>setName(e.target.value)}
           required className='w-full pl-2 py-2 border-b border-zinc-200focus: outline-none focus: border-zinc-950 text-sm text-zinc-900
          bg-transparent placeholder-zinc-300 transition-colors'
          placeholder='Naveen Niranjan' /> 

          </div>
        )}
         <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
              Full Name
            </label>
          <input type="text" value ={email} onChange={(e)=>setEmail(e.target.value)}
           required className='w-full pl-2 py-2 border-b border-zinc-200focus: outline-none focus: border-zinc-950 text-sm text-zinc-900
          bg-transparent placeholder-zinc-300 transition-colors'
          placeholder='Jointwith@example.com' /> 
          
          </div>
        {/* if the password is false , print password label again in console*/}
        <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
              Password
            </label>
          <div className='relative'>
          <input type="showPassword" value ={password} onChange={(e)=>setPassword(e.target.value)} required 
          className='w-full pl-2 py-2 border-b border-zinc-200 focus: outline-none focus: border-zinc-950 text-sm text-zinc-900
          bg-transparent placeholder-zinc-300 pr-8'
          placeholder="••••••••" /> 
          {/* buttons for password to tolerate*/}
          <button type="button" onClick={()=> setshowPassword(!showPassword)}
         className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-300
        hover: text-zinc-600 flex items-center justify-center
          cursor-pointer transition-colors"> 

          

          </button>
          </div>
          </div>

      </form>

      <p>
        {islogin ? (
          <>
          New to BuilderAI?{""}
         
          <Link to="/register" className=" text-zinc-900 font-medium hover:underline">
           Create an account
          </Link>
          </>
        ):(
          <>
           New to BuilderAI?{""}
         
          <Link to="/login" className=" text-zinc-900 font-medium hover:underline">
           Sign in here
           </Link>
          </>
        )}
      </p>
      </div>
      </div>

    </div>
  )
}

export default AuthPage