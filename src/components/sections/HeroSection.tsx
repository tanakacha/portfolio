import Image from "next/image";
import { getPublicProfile } from "@/content/public/profile.public";
import { CURRENT_THEME } from "@/lib/constants";
import TsurezureCard from "./TsurezureCard";
import { Post } from "@/types/post";

interface Props {
  posts: Post[];
}

export default async function HeroSection({ posts }: Props) {
  const profile = await getPublicProfile();

  return (
    <section
      id="top"
      className="w-full"
      style={{ backgroundColor: CURRENT_THEME.background }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div
          className="grid grid-cols-1 md:grid-cols-[300px_auto_300px] gap-8 items-center"
          style={{ justifyContent: "space-between" }}
        >
          <div className="flex items-center justify-center">
            <div
              className="w-[300px] h-[300px] rounded-full overflow-hidden border-4 flex items-center justify-center shrink-0"
              style={{
                borderColor: CURRENT_THEME.border,
                backgroundColor: CURRENT_THEME.background,
              }}
            >
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={profile.displayName}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="text-6xl font-bold"
                  style={{ color: CURRENT_THEME.border }}
                >
                  {profile.displayName.charAt(0)}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center text-center md:text-left">
            <h1
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: CURRENT_THEME.text }}
            >
              {profile.displayName}
            </h1>
            <p
              className="text-lg mb-4"
              style={{ color: CURRENT_THEME.text }}
            >
              {profile.tagline}
            </p>
            <div>
              <h2
                className="font-semibold mb-2"
                style={{ color: CURRENT_THEME.text }}
              >
                趣味
              </h2>
              <ul className="flex flex-wrap gap-2 justify-center md:justify-start">
                {profile.hobbies.map((hobby, idx) => (
                  <li
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm border-2"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: CURRENT_THEME.border,
                      color: CURRENT_THEME.text,
                    }}
                  >
                    {hobby}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <TsurezureCard posts={posts} />
        </div>
      </div>
    </section>
  );
}
