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
                <svg className={styles.iconLogIn} aria-hidden="true">
                  <use href="/sprite.svg#icon-log-in-01" />
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
                  <svg className={styles.iconLogIn} aria-hidden="true">
                    <use href="/sprite.svg#icon-log-in-01" />
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
                    <svg className={styles.iconEdit} aria-hidden="true">
                      <use href="/sprite.svg#icon-pencil" />
                    </svg>
                    Edit Profile
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
