// Root router — defines all client-side routes, separating guest-only (login/register) and auth-protected pages.
import React from 'react'
import {Route,Routes} from 'react-router-dom'
import {AuthLayout, GuestLayout} from './pages/Layout'
import AuthPage from './pages/AuthPage'
import Homepages from './pages/Homepages'
import BuilderPage from'./pages/Builderpage'
import PreviewPage from './pages/PreviewPage'
import { Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PublishPage from './pages/Publish';
const App = () => {
  return(
    <>
    <Toaster></Toaster>
    <Routes>
      {/*Login Routes*/}
      <Route element={<GuestLayout/>}>
       <Route path='/login' element={<AuthPage mode="login"/>}/>
       <Route path='/register' element={<AuthPage mode="register"/>}/>
      </Route>

      {/* Protected Routes */}
      <Route element={<AuthLayout/>}>
       <Route path='/' element={<Homepages/>}/>
       <Route path='/builder/:id' element={<BuilderPage />}/>
       <Route path='/preview/:id' element={<PreviewPage/>}/>
      </Route>
      

      {/* public Routes */}
      <Route path='/publish/:id' element={<PublishPage/>}/>

      {/* Catch-all */}
      <Route path='*' element={<Navigate to="/" replace />}/>
    </Routes>
    </>
   
    
  )
}
export default App