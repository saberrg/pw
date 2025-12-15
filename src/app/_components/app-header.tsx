"use client";

import Header from "@/components/ui/header";
import AuthButton from "./auth-button";
import { ThemeSwitcher } from "./theme-switcher";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <Header
      siteName="My Personal Website"
      subtitle="Gloria in Excelsis Deo"
      logoHref="/"
      currentPath={pathname}
      LinkComponent={Link}
      navItems={[
        { label: "Directory", href: "/directory" },
        { label: "Quick Ref", href: "/quickref" },
      ]}
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

