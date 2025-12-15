"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, getUser } from "@/lib/supabase-auth";
import Link from "next/link";

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    // Listen for auth changes
    const interval = setInterval(() => {
      checkUser();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const checkUser = async () => {
    try {
      const { user: currentUser } = await getUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {user.email}
        </span>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/gg"
      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
    >
      Sign In
    </Link>
  );
}

