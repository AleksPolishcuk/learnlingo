"use client";
import { useState } from "react";
import { User } from "@/types";
import styles from "./UserAvatar.module.css";

interface Props {
  user: Pick<User, "name" | "avatar_url">;
  size?: number;
}

export default function UserAvatar({ user, size = 40 }: Props) {
  const [imgError, setImgError] = useState(false);

  const initial = user.name?.[0]?.toUpperCase() ?? "?";
  const showImage = !!user.avatar_url && !imgError;

  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {showImage ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          className={styles.img}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={styles.initial}>{initial}</span>
      )}
    </div>
  );
}
