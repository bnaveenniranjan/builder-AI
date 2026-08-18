import React from 'react'
import {Route,Routes} from 'react-router-dom'
import {AuthLayout, GuestLayout} from './pages/Layout'
import AuthPage from './pages/AuthPage'
import Homepages from './pages/Homepages'
import BuilderPage from'./pages/Builder.page'
import previewPage from './pages/PreviewPage'

const App = () => {
  return(
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
       <Route path='/preview/:id' element={<previewPage/>}/>
      </Route>
      
    </Routes>
  )
}
export default App