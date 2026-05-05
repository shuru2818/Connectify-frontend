import {React, useEffect} from "react"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Home from "./pages/Home"
import Features from "./pages/ViewFeatures"
import ChatPage from "./pages/ChatPage"
import InvitationPage from "./pages/InvitationPage"
import ProtectedRoute from "./components/ProtectedRoute"
import NotificationPage from "./pages/NotificationPage"
import GroupChatPage from "./pages/GroupChatPage"
import socket from "./socket"

function App() {

    useEffect(() => {
      socket.on("newNotification", (data) => {
        console.log("NEW NOTIFICATION:", data);

        window.dispatchEvent(
          new CustomEvent("new_notification", { detail: data })
        );
      });

      return () => socket.off("newNotification");
    }, []);
   
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
      <Route path="/notifications" element={<ProtectedRoute><NotificationPage/></ProtectedRoute>}></Route>
      <Route path="/groupchat" element={<ProtectedRoute><GroupChatPage/></ProtectedRoute>}></Route>
       
    </Routes>


    </BrowserRouter>
    </>
  )
}

export default App
