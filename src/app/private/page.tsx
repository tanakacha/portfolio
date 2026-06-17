import Header from "@/components/Header";
import PrivateHeroSection from "@/components/sections/PrivateHeroSection";
import PrivateNewsSection from "@/components/sections/PrivateNewsSection";
import PrivateHistorySection from "@/components/sections/PrivateHistorySection";
import WorksSection from "@/components/sections/WorksSection";
import IdeasSection from "@/components/sections/IdeasSection";
import { getPrivateProfile } from "@/content/private/profile.private";
import { getPublicWorks } from "@/content/public/works.public";
import { getPrivatePosts } from "@/content/private/posts.private";
import { getPrivateIdeas } from "@/content/private/ideas.private";

export const dynamic = "force-dynamic";

export default async function PrivatePage() {
  const [profile, works, posts, ideas] = await Promise.all([
    getPrivateProfile(),
    getPublicWorks(),
    getPrivatePosts(),
    getPrivateIdeas(),
  ]);
  return (
    <div>
      <Header variant="private" isAuthed={true} title={profile.fullName} />
      <main style={{ paddingTop: "100px" }}>
        <PrivateHeroSection posts={posts} />
        <PrivateNewsSection />
        <WorksSection works={works} />
        <IdeasSection ideas={ideas} />
        <PrivateHistorySection />
      </main>
    </div>
  );
}
