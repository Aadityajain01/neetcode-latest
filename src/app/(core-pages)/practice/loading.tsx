import MainLayout from "@/components/layouts/main-layout";
import { PracticePageSkeleton } from "@/components/skeletons/site-skeletons";

export default function Loading() {
  return (
    <MainLayout>
      <PracticePageSkeleton />
    </MainLayout>
  );
}
