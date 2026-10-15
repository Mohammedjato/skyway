import TrackerClient from "./TrackerClient";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ flight?: string }>;
}) {
  const { flight } = await searchParams;
  return <TrackerClient initialFlight={flight ?? ""} />;
}
