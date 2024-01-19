export default function Avatar({ username, userId }) {
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
    <div className={"w-8 h-8 rounded-full flex items-center " + bgColor}>
      <div className="text-center w-full">{username[0].toUpperCase()}</div>
    </div>
  );
}
