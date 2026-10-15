import TripsClient from "./TripsClient";

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ pnr?: string; email?: string }>;
}) {
  const { pnr, email } = await searchParams;
  return <TripsClient initialPnr={pnr ?? ""} initialEmail={email ?? ""} />;
}
