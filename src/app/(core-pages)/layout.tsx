import MainLayout from "@/components/layouts/main-layout";

export default function CorePagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
