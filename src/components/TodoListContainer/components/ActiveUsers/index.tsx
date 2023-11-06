interface User {
  userId: string;
  userName: string;
}

interface ActiveUsersProps {
  activeUsers: User[];
}

export default function ActiveUsers({ activeUsers }: ActiveUsersProps) {
  return (
    <div className="h-10 flex mb-4">
      {activeUsers?.map((user: User) => (
        <div className="w-7 h-7 flex justify-center items-center uppercase text-xs rounded-full bg-emerald-600 text-white mr-2">
          {user.userName}
        </div>
      ))}
    </div>
  );
}
