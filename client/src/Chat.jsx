import { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";

export default function Chat() {
  const [ws, setWs] = useState(null);

  const [onlinePeople, setOnlinePeople] = useState([]);

  const [selectedContact, setSelectedContact] = useState(null);

  const [newMessage, setNewMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const { username, id } = useContext(UserContext);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000/");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  function showOnline(peopleArr) {
    //remove duplicates
    const people = {};
    peopleArr.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    console.log(people);
    setOnlinePeople(people); //<---------------
  }

  const onlinePeopleExcludingUs = { ...onlinePeople };
  delete onlinePeopleExcludingUs[id];

  function handleMessage(event) {
    const messageData = JSON.parse(event.data);
    console.log(event, messageData);
    if ("online" in messageData) {
      showOnline(messageData.online);
    } else {
      setMessages(prev => ([...prev, {isOur: false, text: messageData.text}]))
    }
  }

  function sendMessage(event) {
    event.preventDefault(); //to prevent page from reloading
    ws.send(JSON.stringify({
        recipient: selectedContact,
        text: newMessage
    }))
    setMessages(prev => ([...prev, {text: newMessage, isOur: true}]))
    setNewMessage("");
  }

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 pt-4">
        <Logo />
        <div>
          {Object.keys(onlinePeopleExcludingUs).map((userId) => {
            return (
              <div
                key={userId}
                onClick={() => setSelectedContact(userId)} //update style if clicked
                className={
                  "border-b border-gray-100 h-12 cursor-pointer flex " +
                  (selectedContact === userId ? "bg-blue-100" : "")
                }
              >
                {userId === selectedContact && (
                  <div className="w-1 h-12 rounded-r-md bg-blue-500"></div> //<------------------ active blue bar
                )}
                <div className="pl-4 flex items-center gap-2">
                  <Avatar
                    username={onlinePeopleExcludingUs[userId]}
                    userId={userId}
                  />{" "}
                  {/*<----------- avatar */}
                  <span className="text-gray-800">
                    {onlinePeopleExcludingUs[userId]}
                  </span>{" "}
                  {/*<----------- name*/}
                </div>
              </div>
            );
          })}
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
            <div>
              {messages.map(message => (
                <div>{message.text}</div>
              ))}
            </div>
          )}
        </div>
        {selectedContact && (
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={event => setNewMessage(event.target.value)}
            placeholder="Type your message here"
            className="bg-white flex-grow border p-2 rounded-sm"
          />
          <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
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
