"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Book" },
  { href: "/track", label: "Track flights" },
  { href: "/trips", label: "My trips" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <header className="nav">
      <div className="wrap-page row between">
        <Link href="/" className="brand">✈ Skyway</Link>
        <nav className="row gap">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path === l.href ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
