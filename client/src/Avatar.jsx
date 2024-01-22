export default function Avatar({ username, userId, online }) {
  const colors = [
    "bg-blue-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-purple-200",
    "bg-red-200",
    "bg-teal-200",
  ];

  const userIdBase10 = parseInt(userId, 16);

  const bgColor = colors[userIdBase10 % colors.length];

  return (
    <div className={"w-8 h-8 relative rounded-full flex items-center " + bgColor}> {/*you have to use relative so the position we give to the green dot inside this div will be put with respect to (relative) this div and not the entire webpage*/}
      <div className="text-center w-full opacity-80">{username[0].toUpperCase()}</div>
      {online && (
        <div className="absolute h-3 w-3 rounded-full bottom-0 right-0 bg-green-500"></div>
      )}
      {!online && (
        <div className="absolute h-3 w-3 rounded-full bottom-0 right-0 bg-gray-400"></div>
      )}
    </div>
  );
}
