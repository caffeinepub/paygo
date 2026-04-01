import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useLogin } from "../hooks/useQueries";

// This page is no longer used in the main flow since RootLayout handles
// auto-login. Kept as a fallback component.
export default function ProfileSetup() {
  const { identity } = useInternetIdentity();
  const loginMutation = useLogin();

  useEffect(() => {
    if (identity && !loginMutation.isPending && !loginMutation.isSuccess) {
      loginMutation.mutate();
    }
  }, [
    identity,
    loginMutation.isPending,
    loginMutation.isSuccess,
    loginMutation.mutate,
  ]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Welcome to PayGo</CardTitle>
          <CardDescription>
            Setting up your account, please wait...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}
