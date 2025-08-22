import Header from "../components/Header";

export default function Home() {
  return (
    <div>
      <Header />
      
      {/* 一時的なコンテンツ */}
      <main style={{ paddingTop: '100px' }}>
        <h1>ポートフォリオサイト</h1>
        <p>ヘッダーの見た目を確認中...</p>
      </main>
    </div>
  );
}
