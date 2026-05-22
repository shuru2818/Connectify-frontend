import { createRoot } from 'react-dom/client'
import "./style.css"
import App from './App.jsx'
import {GoogleOAuthProvider} from "@react-oauth/google"

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId='1019652628009-elbh6s8qi0ckg2abm14j88q5b1reuk5d.apps.googleusercontent.com'>
      <App />
  </GoogleOAuthProvider>

)
