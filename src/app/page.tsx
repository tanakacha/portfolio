import TopSection from "@/components/sections/TopSection";
import Header from "../components/Header";

export default function Home() {
  return (
    <div>
      <Header />
      {/* 一時的なコンテンツ */}
      <main style={{ paddingTop: '100px' }}>
        <TopSection />
      </main>
    </div>
  );
}
