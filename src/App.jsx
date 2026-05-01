import React from "react"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Home from "./pages/Home"
import Features from "./pages/ViewFeatures"
import ChatPage from "./pages/ChatPage"
import InvitationPage from "./pages/InvitationPage"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
   
  return (
    <>

    <BrowserRouter>
    <Routes>

      <Route path="/" element={<Home/>}></Route>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/signup" element={<Signup/>}></Route>
      <Route path="/features" element={<ProtectedRoute><Features/></ProtectedRoute>}></Route>
      <Route path="/chat" element={<ProtectedRoute><ChatPage/></ProtectedRoute>}></Route>
      <Route path="/invitation" element={<ProtectedRoute><InvitationPage/></ProtectedRoute>}></Route>
       
    </Routes>


    </BrowserRouter>
    </>
  )
}

export default App
