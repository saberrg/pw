"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/supabase-auth";
import QuickRefForm from "./quick-ref-form";

interface QuickRefFormWrapperProps {
  onSuccess?: () => void;
}

export default function QuickRefFormWrapper({ onSuccess }: QuickRefFormWrapperProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
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

  const handleSuccess = () => {
    router.refresh();
    if (onSuccess) {
      onSuccess();
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return <QuickRefForm onSuccess={handleSuccess} />;
}



