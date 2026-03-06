import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Signup",
  description:
    "Join ClickIn as a staff member. Register your account and start managing orders and payments.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StaffSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
