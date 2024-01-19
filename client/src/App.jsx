import React, { useContext } from "react"
import axios from "axios"
import { UserContext, UserContextProvider } from "./UserContext";
import Routes from "./Routes";

function App() {

  axios.defaults.baseURL = "http://localhost:4000"; //settinf default url so its easier for us later
  axios.defaults.withCredentials = true; //helps us to use cookies from our api

  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
