import { useState } from "react";

function parseAchievement(value?: string) {
  if (!value) return null;

  const match =
    value.match(/achievement\/machine\/(?:preview\/)?(\d+)\/(\d+)/) ??
    value.match(/^\s*(\d+)\D+(\d+)\s*$/);

  if (!match) return null;

  const [, user, machine] = match;

  return {
    page: `https://labs.hackthebox.com/achievement/machine/${user}/${machine}`,
    image: `https://labs.hackthebox.com/achievement/machine/preview/${user}/${machine}.png`,
  };
}

export default function AchievementCard({
  value,
  name,
}: {
  value?: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  const achievement = parseAchievement(value);

  if (!achievement || failed) return null;

  return (
    <figure className="mb-10">
      <a
        href={achievement.page}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-block overflow-hidden rounded-xl border border-line transition-colors hover:border-accent"
      >
        <img
          src={achievement.image}
          alt={`${name} pwned on Hack The Box`}
          width={700}
          height={360}
          loading="lazy"
          onError={() => setFailed(true)}
          className="block h-auto w-full max-w-[700px]"
        />
      </a>
      <figcaption className="mt-2 font-mono text-xs text-ink-soft">
        Proof of pwn · Hack The Box ↗
      </figcaption>
    </figure>
  );
}