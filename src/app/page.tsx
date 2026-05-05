import TopSection from "@/components/sections/TopSection";
import Header from "@/components/Header";
import WorksSection from "@/components/sections/WorksSection";
import HistorySection from "@/components/sections/HistorySection";
import WelcomeModal from "@/components/WelcomeModal";
import { getAuthState } from "@/lib/auth-session";
import { getPublicWorks } from "@/content/public/works.public";

export default async function Home() {
  const [isAuthed, works] = await Promise.all([
    getAuthState(),
    getPublicWorks(),
  ]);
  return (
    <div>
      <Header variant="public" isAuthed={isAuthed} title="Chisa" />
      <main style={{ paddingTop: "100px" }}>
        <TopSection />
        <WorksSection works={works} />
        <HistorySection />
      </main>
      <WelcomeModal isAuthed={isAuthed} />
    </div>
  );
}
