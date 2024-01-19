import axios from "axios";
import React, { useEffect } from "react";

export const UserContext = React.createContext({})

export function UserContextProvider({children}) {

    const [username, setUsername] = React.useState(null)
    const [id, setId] = React.useState(null)

    useEffect(() => {
        axios.get('/profile', { withCredentials: true }).then(res => {
            setId(res.data.userId)
            setUsername(res.data.username)
        });
    }, [])

    return(
        <UserContext.Provider value={{username, setUsername, id, setId}}>
            {children}
        </UserContext.Provider>
    )
}