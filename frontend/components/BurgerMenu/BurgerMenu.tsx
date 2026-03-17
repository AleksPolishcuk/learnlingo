"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "@/types";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import styles from "./BurgerMenu.module.css";

interface NavLink {
  href: string;
  label: string;
}

interface BurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  navLinks: NavLink[];
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onProfile: () => void;
  isBusiness: boolean;
}

export default function BurgerMenu({
  isOpen,
  onClose,
  user,
  navLinks,
  onLogin,
  onRegister,
  onLogout,
  onProfile,
  isBusiness,
}: BurgerMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;

      if (isOpen) {
        onClose();
      }
    }
  }, [pathname, isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const handleProfile = () => {
    onProfile();
    onClose();
  };

  const handleLogin = () => {
    onLogin();
    onClose();
  };

  const handleRegister = () => {
    onRegister();
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div ref={menuRef} className={styles.panel}>
        <div className={styles.header}>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg className={styles.closeIcon} aria-hidden="true">
              <use href="/sprite.svg#icon-x" />
            </svg>
          </button>
        </div>

        {user ? (
          <div className={styles.content}>
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <UserAvatar user={user} size={56} />
                <div className={styles.userDetails}>
                  <div className={styles.userName}>
                    {user.name} {user.surname}
                  </div>
                  <div className={styles.userRole}>
                    {isBusiness ? "Teacher" : "Student"}
                  </div>
                </div>
              </div>

              <button className={styles.profileBtn} onClick={handleProfile}>
                <svg className={styles.icon} aria-hidden="true">
                  <use href="/sprite.svg#icon-pencil" />
                </svg>
                {isBusiness ? "Profile & Ads" : "Edit Profile"}
              </button>
            </div>

            <nav className={styles.nav}>
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.navLink} ${
                    pathname === href ? styles.navLinkActive : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className={styles.actions}>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <svg className={styles.icon} aria-hidden="true">
                  <use href="/sprite.svg#icon-log-in-01" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.content}>
            <nav className={styles.nav}>
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.navLink} ${
                    pathname === href ? styles.navLinkActive : ""
                  }`}
                  onClick={handleLinkClick}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className={styles.actions}>
              <button className={styles.loginBtn} onClick={handleLogin}>
                <svg className={styles.icon} aria-hidden="true">
                  <use href="/sprite.svg#icon-log-in-01" />
                </svg>
                Log in
              </button>
              <button className={styles.registerBtn} onClick={handleRegister}>
                Registration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
