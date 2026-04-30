import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/features/auth/store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SignInButton } from "@/features/auth/SignInButton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function UserMenu() {
  const user = useAuthStore(store => store.user);
  const logout = useAuthStore(store => store.logout);

  if(!user) {
    return (
      <div className="flex space-x-2 items-center">
        {/*<Button variant="ghost" size="sm" className="text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/5 font-medium text-xs tracking-wide">
          ✦ Premium
        </Button>*/}
        <SignInButton />
      </div>
    )
  }

  const initials = user.handle.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.handle}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-400 focus:text-red-400">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}