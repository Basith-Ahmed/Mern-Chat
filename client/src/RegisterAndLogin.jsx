import React, { useContext } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export default function RegisterAndLogin() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLogin, setIsLogin] = React.useState(false);

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function onSubmit(event) {
    event.preventDefault();
    const url = isLogin ? "/login" : "/register";
    const { data } = await axios.post(
      url,
      { username, password },
      { withCredentials: true }
    );
    setLoggedInUsername(username);
    setId(data.id);
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto" onSubmit={onSubmit}>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLogin ? "Login" : "Register"}
        </button>
        <div className="text-center mt-2">
          {isLogin && (
            <div>
              Not a user?
              <button
                className="ml-1 text-sky-400"
                onClick={() => setIsLogin(false)}
              >
                Register.
              </button>
            </div>
          )}
          {!isLogin && (
            <div>
              Already a user?
              <button
                className="ml-1 text-sky-400"
                onClick={() => setIsLogin(true)}
              >
                Login.
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
