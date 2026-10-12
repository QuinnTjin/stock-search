const formatPrice = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

type QuoteStatsProps = {
  current: number;
  high: number;
  low: number;
  previousClose: number;
};

// U8: the extra quote context shown beneath the opening price — current,
// day high/low, and previous close. Presentational only, so it works in both
// the client lookup form and the server-rendered detail page.
export function QuoteStats({ current, high, low, previousClose }: QuoteStatsProps) {
  const stats: Array<{ label: string; value: number }> = [
    { label: "Current", value: current },
    { label: "High", value: high },
    { label: "Low", value: low },
    { label: "Prev close", value: previousClose },
  ];

  return (
    <dl className="result-card__stats">
      {stats.map((stat) => (
        <div className="result-card__stat" key={stat.label}>
          <dt className="data-label">{stat.label}</dt>
          <dd className="result-card__stat-value">{formatPrice.format(stat.value)}</dd>
        </div>
      ))}
    </dl>
  );
}
