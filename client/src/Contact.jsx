import Avatar from "./Avatar";

export default function Contact({userId, selectedContact, onlineOrOfflinePeople, setSelectedContact, online}) {
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
          online={online}
          username={onlineOrOfflinePeople[userId]}
          userId={userId}
        />{" "}
        {/*<----------- avatar */}
        <span className="text-gray-800">
          {onlineOrOfflinePeople[userId]}
        </span>{" "}
        {/*<----------- name*/}
      </div>
    </div>
  );
}
