import TopSection from "@/components/sections/TopSection";
import Header from "../components/Header";
import WorksSection from "@/components/sections/WorksSection";
import HistorySection from "@/components/sections/HistorySection";

export default function Home() {
  return (
    <div>
      <Header />
      {/* 一時的なコンテンツ */}
      <main style={{ paddingTop: '100px' }}>
        <TopSection />
        <WorksSection />
        <HistorySection />
      </main>
    </div>
  );
}
