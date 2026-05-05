import { getPrivateHistory } from "@/content/private/history.private";
import { CURRENT_THEME } from "@/lib/constants";

export default async function PrivateHistorySection() {
  const history = await getPrivateHistory();
  return (
    <section
      id="history"
      className="py-16"
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">History</h2>
        {/* モバイル用 */}
        <div className="block md:hidden relative">
          <div
            className="absolute left-16 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: CURRENT_THEME.border, height: "100%" }}
          />
          {history.map((item) => (
            <div key={item.id} className="flex mb-6 relative">
              <div className="w-16 flex-shrink-0 pt-3">
                <p
                  className="text-xs"
                  style={{ color: CURRENT_THEME.textSecondary }}
                >
                  {item.date}
                </p>
              </div>
              <div className="flex-1 pl-4 pb-6 relative">
                <div
                  className="absolute w-2 h-2 rounded-full top-4 z-10"
                  style={{
                    backgroundColor: CURRENT_THEME.border,
                    left: "-3px",
                  }}
                />
                <h3
                  className="text-base font-semibold mb-1"
                  style={{ color: CURRENT_THEME.text }}
                >
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: CURRENT_THEME.text }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* PC用 */}
        <div className="hidden md:block relative">
          <div
            className="absolute left-28 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: CURRENT_THEME.border, height: "100%" }}
          />
          {history.map((item) => (
            <div key={item.id} className="flex mb-8 relative">
              <div className="w-28 flex-shrink-0 pt-5">
                <p
                  className="text-sm font-medium"
                  style={{ color: CURRENT_THEME.textSecondary }}
                >
                  {item.date}
                </p>
              </div>
              <div className="flex-1 pl-8 pb-8 relative">
                <div
                  className="absolute w-3 h-3 rounded-full top-6 z-10"
                  style={{
                    backgroundColor: CURRENT_THEME.border,
                    left: "-5px",
                  }}
                />
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: CURRENT_THEME.text }}
                >
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: CURRENT_THEME.text }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
