import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Order #${resolvedParams.id} Live Status`,
    description: `Track the live status of your order #${resolvedParams.id} on the Clickin Smart Canteen Ordering Platform.`,
    openGraph: {
      title: `Order Status | Clickin`,
      description: `Track your order securely on Clickin.`,
    }
  };
}

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
