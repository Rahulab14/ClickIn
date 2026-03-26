import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View your recent order updates and notifications on Clickin - Smart Canteen Ordering Platform.",
  openGraph: {
    title: "Notifications | Clickin",
    description: "View your recent order updates and notifications on Clickin.",
  }
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
