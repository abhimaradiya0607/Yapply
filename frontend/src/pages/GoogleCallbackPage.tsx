import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

import useGoogleLogin from "../hooks/useGoogleLogin";

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { googleLoginMutation } = useGoogleLogin();

  useEffect(() => {
    const code = searchParams.get("code");
    const googleError = searchParams.get("error");

    // Google login was cancelled or failed
    if (googleError) {
      toast.error("Google sign-in was cancelled");
      navigate("/login", { replace: true });
      return;
    }

    // Authorization code was not received
    if (!code) {
      toast.error("Google authorization code was not received");
      navigate("/login", { replace: true });
      return;
    }

    // Prevent the same authorization code from being processed twice
    const storageKey = `google-oauth-processing:${code}`;

    if (sessionStorage.getItem(storageKey)) {
      return;
    }

    sessionStorage.setItem(storageKey, "true");

    const login = async () => {
      try {
        await googleLoginMutation(code);

        // Let App.tsx/auth routing handle:
        // authenticated + onboarded → /
        // authenticated + not onboarded → /onboarding
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Google login failed:", error);

        // Get the error message returned by the backend
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;

        toast.error(message ?? "Unable to sign in with Google");

        navigate("/login", { replace: true });
      }
    };

    login();
  }, [searchParams, navigate, googleLoginMutation]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>

        <h1 className="text-lg font-semibold text-foreground">
          Signing you in with Google...
        </h1>

        <p className="mt-2 text-sm text-muted">
          Please wait while we complete your sign-in.
        </p>
      </div>
    </main>
  );
};

export default GoogleCallbackPage;