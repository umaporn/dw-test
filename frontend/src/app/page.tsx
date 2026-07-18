import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="landing-hero">
        <div className="container">
          <h1>Free concert tickets, one seat per show.</h1>
          <p>
            Browse upcoming concerts, reserve your seat, and manage bookings.
            Admins can publish listings and review the full reservation audit
            trail.
          </p>
          <div className="landing-actions">
            <Link href="/register?role=USER" className="btn btn-primary">
              Get started as User
            </Link>
            <Link href="/login" className="btn btn-outline">
              User log in
            </Link>
            <Link href="/login/admin" className="btn btn-outline">
              Admin log in
            </Link>
          </div>
        </div>
      </section>

      <section className="container landing-cards">
        <article className="landing-card">
          <h3>For users</h3>
          <p>
            Discover concerts, reserve one seat per event, cancel when plans
            change, and review your private history.
          </p>
        </article>
        <article className="landing-card">
          <h3>For admins</h3>
          <p>
            Create and delete concert listings, monitor stats, and inspect the
            reservation audit trail across all users.
          </p>
        </article>
      </section>
    </>
  );
}
