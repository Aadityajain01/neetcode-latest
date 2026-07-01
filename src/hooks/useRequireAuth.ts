import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useAuthPromptStore } from "@/store/auth-prompt-store";

export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const { openAuthPrompt } = useAuthPromptStore();
  const router = useRouter();

  const requireAuth = (
    action?: () => void,
    message: string = "Sign in to access this feature"
  ): boolean => {
    if (isAuthenticated) {
      if (action) action();
      return true;
    }

    openAuthPrompt(message, () => {
      router.push("/login");
    });
    return false;
  };

  return { requireAuth, isAuthenticated };
}
