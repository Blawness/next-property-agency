/**
 * The map draws only listings that carry lat/lng. When some matches have none,
 * saying so beats a map that quietly shows fewer pins than the search found.
 */
export default function MapCoverageNotice({
  pinned,
  matching,
}: {
  pinned: number
  matching: number
}) {
  const highlight = "font-semibold italic text-primary"

  if (pinned < matching) {
    return (
      <p className="text-sm text-muted-foreground">
        Menampilkan <span className={highlight}>{pinned}</span> dari{" "}
        <span className={highlight}>{matching}</span> properti di peta — sisanya belum punya titik
        koordinat.
      </p>
    )
  }

  return (
    <p className="text-sm text-muted-foreground">
      Menampilkan <span className={highlight}>{matching}</span> properti di peta
    </p>
  )
}
