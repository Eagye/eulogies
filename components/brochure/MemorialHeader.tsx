type Props = {
  name: string;
  dob?: string;
  dod?: string;
  views: number;
  candles: number;
  totalDonations: number;
};

export default function MemorialHeader({
  name,
  dob,
  dod,
  views,
  candles,
  totalDonations,
}: Props) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl font-semibold">In Loving Memory</h1>
      <h2 className="text-2xl font-bold">{name}</h2>

      {(dob || dod) && (
        <p className="text-sm text-gray-500">
          {dob} – {dod}
        </p>
      )}

      <div className="flex justify-center gap-6 text-sm text-gray-500 mt-2">
        <span>👀 {views}</span>
        <span>🕯️ {candles}</span>
        <span>💰 GHS {totalDonations}</span>
      </div>
    </div>
  );
}
