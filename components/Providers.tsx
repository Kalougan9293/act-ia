"use client";

import { AuthProvider } from "@/lib/auth/AuthProvider";
import { BookingProvider } from "@/components/landing/BookingModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BookingProvider>{children}</BookingProvider>
    </AuthProvider>
  );
}
