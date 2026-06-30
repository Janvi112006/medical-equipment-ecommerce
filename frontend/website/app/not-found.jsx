import Link from "next/link";

export const metadata = { title: "Page Not Found" };

const NotFound = () => (
  <div className="container section state-block">
    <h2 style={{ fontFamily: "var(--font-display)" }}>Page not found</h2>
    <p>The page you're looking for doesn't exist.</p>
    <Link href="/" className="btn btn-primary" style={{ marginTop: 8 }}>
      Back to home
    </Link>
  </div>
);

export default NotFound;
