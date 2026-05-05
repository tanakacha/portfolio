import Header from "@/components/Header";
import PrivateTopSection from "@/components/sections/PrivateTopSection";
import PrivateHistorySection from "@/components/sections/PrivateHistorySection";
import WorksSection from "@/components/sections/WorksSection";
import { getPrivateProfile } from "@/content/private/profile.private";
import { getPublicWorks } from "@/content/public/works.public";

export const dynamic = "force-dynamic";

export default async function PrivatePage() {
  const [profile, works] = await Promise.all([
    getPrivateProfile(),
    getPublicWorks(),
  ]);
  return (
    <div>
      <Header variant="private" isAuthed={true} title={profile.fullName} />
      <main style={{ paddingTop: "100px" }}>
        <PrivateTopSection />
        <WorksSection works={works} />
        <PrivateHistorySection />
      </main>
    </div>
  );
}
