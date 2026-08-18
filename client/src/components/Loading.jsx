import React from 'react'

const Loading = () => {
  return (
    <div className='h-screen flex items-center justify-center bg-white'>
    <div><Loader2Icon size ={26} className="animate-spin text-zinc-950"/>
    </div>
  )
}

export default Loading