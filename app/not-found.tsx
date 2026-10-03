import Link from "next/link";
export default function NotFound() { return <main className="error-page container"><h1>This frame is missing</h1><p>The page you’re looking for isn’t here.</p><Link className="button" href="/">Back to the portfolio</Link></main>; }
