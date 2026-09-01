import { FolderOpenIcon } from 'lucide-react';
import React from 'react'

function buildTree(paths){
    const root = [];
    for(const filePath of paths.sort()){
        const parts = filePath.split("/").filter(Boolean)
        let current = root;  

        for(let i = 0 ; i< parts.length; i++){
            const name = parts[i];
            const islast = i === parts.length -1;
            const fullpath = "/" +parts.slice(0,i+1).join("/");
            let existing = current.find((n)=>n.name === name)
            if(!existing){
                existing = {
                    name,
                    path: fullpath,
                    isDir: !islast,
                    children: []
                };
                current.push(existing)
            }
            current
        }
    }
    return root;

}
function TreeNode({node,activeFile,onFileSelect,depth = 0}){
    const isActive = node.path === activeFile;

    if(node.isDir){
        return (
            <div>
                <div className="flex items-center gap-2 py-1 px-2 text-xs text-zinc-400 select-none"
                style={{paddingLeft: `${depth * 12 + 8}`}}>
                    <FolderOpenIcon size={34} className='text-zinc-800 opacity-60'/>
                    <span>{node.name}</span>

                </div>
                {node.children.map((child)=>(
                    <TreeNode />

                ))}
            </div>
        )

    }
const FileExplorer = ({files,activeFile,onFileSelect}) => {

    const tree = useMemo(()=> buildTree(Object.keys(files)),[files])
  return (
    <div className="py-2 overflow-y-auto hide-scrollbar">
        <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Files</p>
        {tree.map((node)=>(
            }


    </div>
  )
}

export default FileExplorer