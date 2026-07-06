import React from 'react'
import { useState } from 'react'
import api from "../api/axios.js"
import {useNavigate} from "react-router-dom"
import GoogleLoginButton from '../components/GoogleLoginButton.jsx'

const Signup = () => {
  const navigate = useNavigate();

const[formdata, setFormdata] = useState({
    username: "",
    email: "",
    phone: "",
    password: ""
});

const[errors, setErrors] = useState({});
const[servererror, setServererror] = useState("");


function handleInput(e){
  const{name, value} = e.target;
  setFormdata((prev)=>({
    ...prev,
    [name]:value
  }))

  if(errors[name]){
    setErrors({
      ...errors,
      [name] : ""
    })
  }
}

async function submitForm(e){
  e.preventDefault();

   
  try{
    setServererror("");

    if(!validate()) return;

  let response = await api.post("/auth/signup", formdata);
  if(response){
    localStorage.setItem("pendingVerificationEmail", response.data.user?.email || formdata.email);
    navigate('/verify-otp', { state: { email: response.data.user?.email || formdata.email } });
  }
  }catch(err){
    console.log(err);

    if(err.response && err.response.data && err.response.data.message){
      setServererror(err.response.data.message);
    }else{
      setServererror("Something went wrong. Please try again.");
    }
  }
}

function validate(){

  let newErrors = {};
  

  if (!formdata.username) {
  newErrors.username = "Name is Required";
} else {
  const username = formdata.username;

  const usernameRegex =
    /^[a-zA-Z][a-zA-Z0-9._-]{2,}$/;

  if (!usernameRegex.test(username)) {
    newErrors.username =
      "Username must start with a letter and can contain letters, numbers, _ . - (min 3 chars)";
  }
}



  if (!formdata.email) {
    newErrors.email = "Email is Required";
  } else {
    const email = formdata.email;

    const emailFormat =
      /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailFormat.test(email)) {
      newErrors.email =
        "Email must start with a letter and be a valid format";
    }
  }

  if(!formdata.phone){
    newErrors.phone = "Phone Number is Required";
  }else if(!/^[0-9]{10}/.test(formdata.phone)){
    newErrors.phone = "Please enter a valid phone number"
  }


  if (!formdata.password) {
    newErrors.password = "Password is Required";
  } else {
    const password = formdata.password;

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

    if (!strongPasswordRegex.test(password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number & special character (min 6 chars)";
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form 
        onSubmit={submitForm}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-200 space-y-4"
      >
      <img src='/chatapplogo.png' className='w-26 h-22 mx-auto'></img>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
          Create your account
        </h2>

        <div>
          <input 
            type='text' 
            placeholder='Username' 
            name='username' 
            value={formdata.username} 
            onChange={handleInput}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {errors.username && (<p className="text-red-500 text-sm mt-1">{errors.username}</p>)}
        </div>

        <div>
          <input 
            type='text' 
            placeholder='Email address' 
            name='email' 
            value={formdata.email} 
            onChange={handleInput}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {errors.email && (<p className="text-red-500 text-sm mt-1">{errors.email}</p>)}
        </div>

        <div>
          <input 
            type='password' 
            placeholder='Password' 
            name='password' 
            value={formdata.password} 
            onChange={handleInput}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {errors.password && (<p className="text-red-500 text-sm mt-1">{errors.password}</p>)}
        </div>

        <div>
          <input 
            type='text' 
            placeholder='Phone number' 
            name='phone' 
            value={formdata.phone} 
            onChange={handleInput}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          {errors.phone && (<p className="text-red-500 text-sm mt-1">{errors.phone}</p>)}
        </div>

        {servererror && (<p className="text-red-500 text-sm text-center">{servererror}</p>)}
        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition duration-200"
        >
          Create Account
        </button>
        <GoogleLoginButton/>
      </form>
    </div>
  )
}

export default Signup;