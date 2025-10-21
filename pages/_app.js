import "../styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import authService from "../utils/auth";
import Login from "./login";
import Loading from "../components/Loading";

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing authentication...');
        await authService.init();
        const currentUser = await authService.getCurrentUser();
        console.log('Current user:', currentUser ? currentUser.username : 'None');
        setUser(currentUser);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Only run in browser
    if (typeof window !== 'undefined') {
      initAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Allow access to login and register pages without authentication
  if (router.pathname === "/login" || router.pathname === "/register") {
    return <Component {...pageProps} />;
  }

  if (loading) return <Loading />;
  if (!user) {
    router.push("/login");
    return <Loading />;
  }

  return <Component {...pageProps} user={user} />;
}

export default MyApp;
