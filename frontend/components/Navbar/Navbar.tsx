"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import styles from "./Navbar.module.css";
import Image from "next/image";
interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfile: () => void;
}

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/teachers", label: "Teachers" },
];

const PRIVATE_LINKS = [
  { href: "/favorites", label: "Favorites" },
  { href: "/reservations", label: "My Reservations" },
];

export default function Navbar({
  user,
  onLogin,
  onRegister,
  onLogout,
  onProfile,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} aria-label="LearnLingo">
          <svg className={styles.logoIcon} aria-hidden="true">
            <use href="/sprite.svg#icon-Logo" />
          </svg>
        </Link>

        <div className={styles.nav}>
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${pathname === href ? styles.navLinkActive : ""}`}
            >
              {label}
            </Link>
          ))}
          {user &&
            PRIVATE_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${pathname === href ? styles.navLinkActive : ""}`}
              >
                {label}
              </Link>
            ))}
        </div>

        <div className={styles.actions}>
          {!user ? (
            <>
              <button className={styles.btnLogin} onClick={onLogin}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Log in
              </button>
              <button className={styles.btnRegister} onClick={onRegister}>
                Registration
              </button>
            </>
          ) : (
            <div ref={menuRef} className={styles.userMenu}>
              <div className={styles.userActions}>
                <button
                  onClick={() => setMenuOpen((p) => !p)}
                  style={{ border: "none", background: "none", padding: 0 }}
                >
                  <UserAvatar user={user} size={42} />
                </button>
                <button className={styles.btnLogout} onClick={onLogout}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>

              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{user.name}</div>
                    <div className={styles.dropdownRole}>{user.role}</div>
                  </div>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      onProfile();
                      setMenuOpen(false);
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
