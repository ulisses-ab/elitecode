import { Button } from "@/components/ui/button";
import { MdCloudUpload } from "react-icons/md";
import { useCallback, useEffect, useState } from "react";
import { useWorkspaceStore } from "../../store";
import { usePostSubmission, useProblemLatestSubmission } from "@/api/hooks/submissions";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";
import { SignInDialog } from "@/features/auth/SignInDialog";

export function SubmitButtons() {
  const editorRef = useWorkspaceStore(state => state.editor);
  const problem = useWorkspaceStore(state => state.problem);
  const setup = useWorkspaceStore((state) => state.setup);
  const onSubmissionFinished = useWorkspaceStore(state => state.onSubmissionFinished);
  const user = useAuthStore(state => state.user);

  const isAuthenticated = !!user;

  const { data: latestSubmission, isSuccess: latestSubmissionFetched } = useProblemLatestSubmission(
    isAuthenticated ? (problem?.id ?? null) : null
  );
  const { mutateAsync: postSubmission, isPending: isSubmitting } = usePostSubmission(problem?.id!);

  const [isSubmissionEvaluating, setIsSubmissionEvaluating] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!editorRef || !problem || !setup) return;

    setJustSubmitted(true);
    try {
      const zipFile = await editorRef.getCurrentZip();
      await postSubmission({
        problemId: problem.id,
        setupId: setup.id,
        file: zipFile,
        temporary: false,
      });
    } catch (error) {
      console.error("Failed to submit:", error);
      setJustSubmitted(false);
    }
  }, [problem, setup, editorRef]);

  useEffect(() => {
    if (!latestSubmissionFetched) return;

    if (latestSubmission?.status === "PENDING") {
      setJustSubmitted(false);
      setIsSubmissionEvaluating(true);
      return;
    }

    setIsSubmissionEvaluating(false);

    if (isSubmissionEvaluating) {
      onSubmissionFinished(latestSubmission!);
    }
  }, [latestSubmission, latestSubmissionFetched]);

  if (!isAuthenticated) {
    return (
      <SignInDialog>
        <Button
          className="w-full !bg-emerald-500/25 border-emerald-500/30 text-emerald-300 hover:!bg-emerald-500/35 hover:border-emerald-500/50 hover:text-emerald-200 transition-none"
          variant="outline"
        >
          <span className="hidden sm:inline">Submit</span>
          <MdCloudUpload />
        </Button>
      </SignInDialog>
    );
  }

  const isPending =
    !latestSubmissionFetched || latestSubmission?.status === "PENDING" || isSubmitting || justSubmitted;

  if (isPending) {
    return (
      <Button
        onClick={() => {}}
        className="w-full bg-white/[0.04] cursor-default border-border/50 text-muted-foreground hover:text-muted-foreground hover:border-border/50 hover:bg-white/[0.04] transition-none"
        variant="outline"
      >
        Pending <Loader2 className="animate-spin"/>
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSubmit}
      className="w-full !bg-emerald-500/25 border-emerald-500/30 text-emerald-300 hover:!bg-emerald-500/35 hover:border-emerald-500/50 hover:text-emerald-200 transition-none"
      variant="outline"
    >
      Submit
      <MdCloudUpload />
    </Button>
  );
}
