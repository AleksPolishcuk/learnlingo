"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import Modal from "@/components/Modal/Modal";
import ProfileModal from "@/components/ProfileModal/ProfileModal";
import NotificationBell from "@/components/NotificationBell/NotificationBell";
import UserAvatar from "@/components/UserAvatar/UserAvatar";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, updateUser, openLogin, openRegister } =
    useAuthContext();

  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isBusiness = user?.role === "business";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const BASE_LINKS = [
    { href: "/", label: "Home" },
    { href: "/teachers", label: "Teachers" },
  ];

  const privateLinks = isBusiness
    ? [
        { href: "/favorites", label: "Favorites" },
        { href: "/dashboard", label: "Dashboard" },
      ]
    : [
        { href: "/favorites", label: "Favorites" },
        { href: "/reservations", label: "Reservations" },
      ];

  const allLinks = user ? [...BASE_LINKS, ...privateLinks] : BASE_LINKS;

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };
  const handleDelete = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="LearnLingo">
            <svg className={styles.logoIcon} aria-hidden="true">
              <use href="/sprite.svg#icon-Logo" />
            </svg>
          </Link>

          <div className={styles.nav}>
            {allLinks.map(({ href, label }) => (
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
                <button className={styles.btnLogin} onClick={openLogin}>
                  <svg className={styles.iconLogIn} aria-hidden="true">
                    <use href="/sprite.svg#icon-log-in-01" />
                  </svg>
                  Log in
                </button>
                <button className={styles.btnRegister} onClick={openRegister}>
                  Registration
                </button>
              </>
            ) : (
              <div ref={menuRef} className={styles.userMenu}>
                <div className={styles.userActions}>
                  <NotificationBell />

                  <button
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                    onClick={() => setMenuOpen((p) => !p)}
                    aria-label="Account menu"
                  >
                    <UserAvatar user={user} size={42} />
                  </button>

                  <button className={styles.btnLogout} onClick={handleLogout}>
                    <svg className={styles.iconLogIn} aria-hidden="true">
                      <use href="/sprite.svg#icon-log-in-01" />
                    </svg>
                    Logout
                  </button>
                </div>

                {menuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownName}>
                        {user.name} {user.surname}
                      </div>
                      <div className={styles.dropdownRole}>
                        {isBusiness ? "Teacher" : "Student"}
                      </div>
                    </div>

                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setProfileOpen(true);
                        setMenuOpen(false);
                      }}
                    >
                      <svg className={styles.iconEdit} aria-hidden="true">
                        <use href="/sprite.svg#icon-pencil" />
                      </svg>
                      {isBusiness ? "Profile & Ads" : "Edit Profile"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} wide>
        {user && (
          <ProfileModal
            user={user}
            onClose={() => setProfileOpen(false)}
            onUpdate={updateUser}
            onDelete={handleDelete}
          />
        )}
      </Modal>
    </>
  );
}
