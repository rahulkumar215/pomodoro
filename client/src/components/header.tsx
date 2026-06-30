import { ChartColumn, CircleUserIcon, ClockCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Settings from "./settings";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@/consts/consts";

const Header = () => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState<User | null>(
    JSON.parse(localStorage.getItem("user") as string),
  );

  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-x-2">
        <span>
          <ClockCheck />
        </span>
        Pomodoro
      </h2>

      <div className="flex items-center gap-4">
        <Button>
          <ChartColumn />
          Reprot
        </Button>

        <Settings />

        {token ? (
          <Avatar>
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        ) : (
          <Button asChild>
            <Link to="/signup">
              <CircleUserIcon />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
