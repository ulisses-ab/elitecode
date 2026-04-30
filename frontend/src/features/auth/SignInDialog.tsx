import { Button } from "@/components/ui/button";
import { useOAuth } from "@/api/hooks/oauth";
import { FaGoogle, FaGithub } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface SignInDialogProps {
  children: React.ReactNode;
}

export function SignInDialog({ children }: SignInDialogProps) {
  const { google, github } = useOAuth();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Choose your preferred login method
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-2">
          <Button
            variant="outline"
            onClick={google}
            className="w-full flex items-center justify-center gap-2.5 h-10 border-border/60 bg-card/50 hover:bg-card transition-colors"
          >
            <FaGoogle className="w-4 h-4" />
            <span className="text-sm">Continue with Google</span>
          </Button>

          {/*<Button
            variant="outline"
            onClick={github}
            className="w-full flex items-center justify-center gap-2.5 h-10 border-border/60 bg-card/50 hover:bg-card transition-colors"
          >
            <FaGithub className="w-4 h-4" />
            <span className="text-sm">Continue with GitHub</span>
          </Button>*/}
        </div>

        <DialogFooter className="sm:justify-start">
          <DialogDescription>
            By signing in you accept our{' '}
            <Link to="/terms" className="text-blue-400 underline hover:text-blue-600">Terms of Service</Link> 
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-400 underline hover:text-blue-600">Privacy Policy</Link>
          </DialogDescription>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
