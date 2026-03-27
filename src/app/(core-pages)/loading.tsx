import { AppRouteSkeleton } from "@/components/skeletons/site-skeletons";
import MainLayout from "@/components/layouts/main-layout";

export default function Loading() {
  return (
    <MainLayout>
      <AppRouteSkeleton />
    </MainLayout>
  );
}
