import HeroSection from "@/components/sections/HeroSection";
import Header from "@/components/Header";
import NewsSection from "@/components/sections/NewsSection";
import WorksSection from "@/components/sections/WorksSection";
import HistorySection from "@/components/sections/HistorySection";
import WelcomeModal from "@/components/WelcomeModal";
import { getAuthState } from "@/lib/auth-session";
import { getPublicWorks } from "@/content/public/works.public";
import { getPublicPosts } from "@/content/public/posts.public";

export default async function Home() {
  const [isAuthed, works, posts] = await Promise.all([
    getAuthState(),
    getPublicWorks(),
    getPublicPosts(),
  ]);
  return (
    <div>
      <Header variant="public" isAuthed={isAuthed} title="Chisa" />
      <main style={{ paddingTop: "100px" }}>
        <HeroSection posts={posts} />
        <NewsSection />
        <WorksSection works={works} />
        <HistorySection />
      </main>
      <WelcomeModal isAuthed={isAuthed} />
    </div>
  );
}
