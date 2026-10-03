"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="error-page container"><h1>Let’s try that again</h1><p>The page couldn’t load. Refresh it or try again.</p><button className="button" onClick={reset}>Try again</button></main>; }
