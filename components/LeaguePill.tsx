export default function LeaguePill({ league }: { league: string }) {
  const cls = `league-pill league-${league}`;
  return <span className={cls}>{league}</span>;
}
