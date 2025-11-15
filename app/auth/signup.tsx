import { router } from "expo-router";
import { useEffect } from "react";

export default function SignUpScreen() {
  useEffect(() => {
    // Redirect to the role selection step
    router.replace("/auth/signup-role");
  }, []);

  return null;
}
