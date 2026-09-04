import React from 'react'
import {SandpackProvider} from '@codesandbox/sandpack-react'

const PreviewPanel = ({project,activeFile,showcode}) => {
    const [showErrorOverlay, setShowErrorOverlay] = useState(true)

    const [liveFiles,setLivefiles] = useState(project.files );
    const [prevProjectKey,setPrevprojectkey] = useState('${project.id}-${project.version}');

    const currentkey = '${project.id}-${project.version}';
    if(currentkey !== prevProjectKey){
        setPrevprojectkey(currentkey);
        setLivefiles(project.files);
    }

    const sandpackFiles = useMemo(()=>{
        const spFiles = {};
        for(const [path,content] of Object.entries(liveFiles)){
            const filecode = typeof content === "string" ? content : content?.content || "":
            spFiles[path] = {
                code : filecode,
                active : path === activeFile,
            }
            {code: content};
        }
        return spFiles;
    }, [liveFiles,activeFile]);
        // custome setup for sandpack provider
  return (
    <div className="h-full w-full ">
    <SandpackProvider key={project._id} template='react' files={sandpackFiles} customSetup={} options={} theme={{}}>

    </SandpackProvider>
    </div>
  )
}

export default PreviewPanel