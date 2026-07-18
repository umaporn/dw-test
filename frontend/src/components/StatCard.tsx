interface StatCardProps {
  label: string;
  value: number | string;
  tone: 'orange' | 'blue' | 'green';
}

export function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <article className={`stat-card stat-card-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
