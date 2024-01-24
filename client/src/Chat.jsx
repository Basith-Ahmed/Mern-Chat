import { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from "axios";
import Contact from "./Contact";

export default function Chat() {
  const [ws, setWs] = useState(null);

  const [onlinePeople, setOnlinePeople] = useState([]);

  const [offlinePeople, setOfflinePeople] = useState([]);

  const [selectedContact, setSelectedContact] = useState(null);

  const [newMessage, setNewMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const { username, id, setId, setUsername } = useContext(UserContext);

  const divUnderMessages = useRef(); //for messages auto sccrolling

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:4000/");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected, trying to connect again!");
        connectToWs();
      }, 1000);
    }); //if the server losses conection it establishes it again
  }

  function showOnline(peopleArr) {
    //remove duplicates
    const people = {};
    peopleArr.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    console.log("Online: ", people);
    setOnlinePeople(people); //<---------------
  }

  function handleMessage(event) {
    const messageData = JSON.parse(event.data);
    console.log(event, messageData);
    if ("online" in messageData) {
      showOnline(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedContact) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  }

  function logout() {
    axios.post("/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  function sendMessage(event, file = null) {
    if (event) event.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedContact,
        text: newMessage,
        file,
      })
    );
    
    if (file) {
      axios.get("/messages/" + selectedContact).then((res) => {
        setMessages(res.data);
      });
    } else {
      setMessages((prev) => [
        ...prev,
        {
          text: newMessage,
          sender: id,
          recipient: selectedContact,
          _id: Date.now(),
        },
      ]);
      setNewMessage("");
    }
  }

  function sendFile(event) {
    const reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = () => {
      //runs after loading the file
      sendMessage(null, {
        info: event.target.files[0], //image is converted to base 64
        data: reader.result,
      });
    };
  }

  useEffect(() => {
    //to swipe to the new messages
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    //get all the registered people to display in side bar
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data //returns an array
        .filter((p) => p._id !== id) //<---------- registered users excluding us
        .filter((p) => !Object.keys(onlinePeople).includes(p._id)); //<---------- people who are not online
      const offlinePeopleObj = {};
      offlinePeopleArr.forEach((p) => {
        //array converting to object
        offlinePeopleObj[p._id] = p.username;
      });
      setOfflinePeople(offlinePeopleObj);
    });
  }, [onlinePeople]);

  useEffect(() => {
    //to see the old messages
    if (selectedContact) {
      axios.get("/messages/" + selectedContact).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedContact]);

  const onlinePeopleExcludingUs = { ...onlinePeople };
  delete onlinePeopleExcludingUs[id];

  const messagesWithoutDupes = uniqBy(messages, "_id");

  console.log("the online people we created", onlinePeopleExcludingUs);
  console.log("the offline people we created", offlinePeople);
  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 pt-4 flex flex-col">
        <div className="flex-grow">
          <Logo />
          <div>
            {Object.keys(onlinePeopleExcludingUs).map((userId) => {
              return (
                // CONTACTS - Online
                <Contact
                  key={userId}
                  userId={userId}
                  onlineOrOfflinePeople={onlinePeopleExcludingUs}
                  setSelectedContact={setSelectedContact}
                  selectedContact={selectedContact}
                  online={true}
                />
              );
            })}
            {Object.keys(offlinePeople).map((userId) => {
              return (
                // CONTACTS - Offline
                <Contact
                  key={userId}
                  userId={userId}
                  onlineOrOfflinePeople={offlinePeople}
                  setSelectedContact={setSelectedContact}
                  selectedContact={selectedContact}
                  online={false}
                />
              );
            })}
          </div>
        </div>
        <div className="p-2 text-center flex justify-center">
          <span className="text-sm text-gray-700 flex items-center mr-2 gap-1 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>

            {username}
          </span>
          <button
            onClick={logout}
            className="bg-red-500 rounded-full p-2 px-4 text-white font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow ">
          {!selectedContact && (
            <div className="h-full flex flex-grow items-center justify-center">
              <div
                role="alert"
                className="relative flex px-2 py-2 text-base text-white bg-blue-500 rounded-lg font-regular items-center justify-center"
              >
                <div className="shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-3 mr-3">
                  No contacts are selected to display messages.
                </div>
              </div>
            </div>
          )}
          {!!selectedContact && (
            <div className="relative h-full">
              {" "}
              {/*the box for scrolling messages start here*/}
              <div className="overflow-y-scroll overflow-hidden absolute inset-0 bottom-2">
                {messagesWithoutDupes.map((message, index) => (
                  <div
                    key={message._id}
                    className={
                      " " +
                      (message.sender === id ? "text-right mr-3" : "text-left")
                    }
                  >
                    <div
                      className={
                        "rounded-full py-2 px-4 my-1 text-sm inline-block " +
                        (message.sender === id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-600")
                      }
                      key={index}
                    >
                      {message.text}
                      {message.file && (
                        <div className="flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                            />
                          </svg>
                          <a
                          target="_blank"
                            className="underline"
                            href={axios.defaults.baseURL + "/uploads" + message.file}
                          >
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {selectedContact && (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              placeholder="Type your message here"
              className="bg-white flex-grow border p-2 px-4 rounded-full"
            />
            <label
              type="button"
              className="bg-blue-200 text-blue-900 rounded-full p-2 flex items-center justify-center"
            >
              <input type="file" className="hidden" onChange={sendFile} />{" "}
              {/*file input sender */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                />
              </svg>
            </label>
            <button
              type="submit"
              className="bg-blue-500 p-2 text-white rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
