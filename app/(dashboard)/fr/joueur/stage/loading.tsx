export default function StageLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/reading.gif"
        alt="Chargement..."
        className="w-24 h-24 object-contain"
      />
    </div>
  );
}
