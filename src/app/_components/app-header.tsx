"use client";

import Header from "@/components/ui/header";
import AuthButton from "./auth-button";
import { ThemeSwitcher } from "./theme-switcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/supabase-auth";

export default function AppHeader() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const navItems = [
    // { label: "Directory", href: "/directory" },
    { label: "Quick Ref", href: "/quickref" },
    { label: "Notes", href: "/notes" },
  ];

  // Add Create Post link for authenticated users
  if (isAuthenticated) {
    navItems.push({ label: "Create Post", href: "/create" });
  }

  return (
    <Header
      siteName="My Personal Website"
      subtitle="Gloria in Excelsis Deo"
      logoHref="/"
      currentPath={pathname}
      LinkComponent={Link}
      navItems={navItems}
      userMenu={
        <>
          <AuthButton />
          <ThemeSwitcher />
        </>
      }
      sticky={true}
    />
  );
}

