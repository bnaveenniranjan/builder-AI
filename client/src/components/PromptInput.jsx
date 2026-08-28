import React,{useRef,useState}  from 'react'
import {cloudUploadIcon, MicIcon } from 'lucide-react'
const PromptInput = ({onSubmit ,loading = false, placeholder = "Describe the website you want to build...",large = false,autoFocus = false,variant = "default"}) => {

    const [value,setValue] = useState("");
    const textareaRef = useRef(null)

    const handleSubmit = (e)=>{
        if(e) e.preventDefault()
        const trimmed = value.trim()
        if(!trimmed || loading) return;
        onSubmit(trimmed)
        setValue("")
    }
   

    const handleKeyDown = (e)=>{
        if(e.key === "Enter " && !e.shiftkey){
            e.preventDefault();
            handleSubmit()
        }

    }
{/* this layout will displayed when we provide glass*/ }
if(variant === "glass"){
   return (
    <form onSubmit={handleSubmit} className='max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-xl ring-1
    ring-white/25 focus-within:ring-2 focus-within:ring-white/30 overflow-hidden mt-6 transition'>

        <textarea Ref={textareaRef} value={value} onchange={(e)=>setValue(e.target.value)} onkeyDown={handleKeyDown} placeholder={placeholder} disabled={loading}
            rows={3} className='w-full p-4 pb-2  resize-none placeholder:text-white/60 outline-none bg-transparent text-white text-base'/>
            
    <div className='flex items-center justify-between pb-3 px-3 gap-2'>
        
        <label htmlFor="file" className="border border-white/20 text-white/80 hover:text-white hover:border-white/30 p-1.5 rounded-md cursor-pointer flex items-center justify-center">
        <input type="file" id='file' hidden/>
        <cloudUploadIcon size={18}/>
        </label>
        <div className='flex items-center justify-end gap-2'>
            <button type='button' className="flex items-center justify-center p-1 text-white/70 hover:text-white cursor-pointer">
            <MicIcon size={18}/>
            </button>

            <button type='button' className="flex items-center justify-center p-1 text-white/70 hover:text-white cursor-pointer">
                <MicIcon size={18}/>
            </button>
           
           {/* we cant allow empty value in button */}
           <button type='submit' disabled={!value.trim() || loading}
           className="flex items-center justify-center p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer">
          <MicIcon size={18}/>
           </button>
           {/* same parameter is passing in this function*/}
           <button type='submit'
           disabled={!value.trim() || loading}
           className="flex items-center justify-center p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 cursor-pointer ">
            {loading ? <Loader2Icon size={18} /> : <ArrowRightIcon size={18}/>}
           </button>
        </div>
    </div>

</form>
   )

}
    return(
        <div> PromptInput</div>
    )
}

export default PromptInput