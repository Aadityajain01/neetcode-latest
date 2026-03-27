import MainLayout from "@/components/layouts/main-layout";

export default function CommunitiesRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <div className="flex flex-col min-h-0">
        {children}
      </div>
    </MainLayout>
  );
}
