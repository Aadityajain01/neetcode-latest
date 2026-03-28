import MainLayout from "@/components/layouts/main-layout";

export default function CommunitiesRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        {children}
      </div>
    </MainLayout>
  );
}
