import React,{useRef,useState}  from 'react'

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

if(variant === "glass"){
   return (
    <form onSubmit={handleSubmit} className='max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-xl ring-1
    ring-white/25 focus-within:ring-2 focus-within:ring-white/30 overflow-hidden mt-6 transition'>

        <textarea Ref={textareaRef} value={value} onchange={(e)=>setValue(e.target.value)} onkeyDown={handleKeyDown} placeholder={placeholder} disabled={loading}
            rows={3} className='w-full p-4 pb-2  resize-none placeholder:text-white/60 outline-none bg-transparent text-white text-base'/>
            
    </form>
   )

}
    return(
        <div> PromptInput</div>
    )
}

export default PromptInput