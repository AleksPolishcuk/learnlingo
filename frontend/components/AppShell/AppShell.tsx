"use client";
import { useAuthContext } from "@/context/AuthContext";
import Navbar from "@/components/Navbar/Navbar";
import Modal from "@/components/Modal/Modal";
import LoginForm from "@/components/AuthForms/LoginForm";
import RegisterForm from "@/components/AuthForms/RegisterForm";
import ProfileModal from "@/components/ProfileModal/ProfileModal";
import Toast from "@/components/Toast/Toast";
import AuthWarnModal from "@/components/AuthWarnModal/AuthWarnModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const {
    user,
    login,
    logout,
    updateUser,
    authModal,
    openLogin,
    openRegister,
    closeAuthModal,
    profileModal,
    openProfile,
    closeProfile,
    authWarn,
    closeAuthWarn,
    openLogin: goLogin,
    openRegister: goRegister,
    toast,
    clearToast,
  } = useAuthContext();

  const handleDelete = () => {
    logout();
    closeProfile();
  };

  return (
    <>
      <Navbar
        user={user}
        onLogin={openLogin}
        onRegister={openRegister}
        onLogout={logout}
        onProfile={openProfile}
      />

      <main>{children}</main>

      <Modal open={authModal === "register"} onClose={closeAuthModal}>
        <RegisterForm
          onSuccess={login}
          onSwitch={() => {
            closeAuthModal();
            setTimeout(openLogin, 50);
          }}
        />
      </Modal>

      <Modal open={authModal === "login"} onClose={closeAuthModal}>
        <LoginForm
          onSuccess={login}
          onSwitch={() => {
            closeAuthModal();
            setTimeout(openRegister, 50);
          }}
        />
      </Modal>

      <Modal open={profileModal} onClose={closeProfile} wide>
        {user && (
          <ProfileModal
            user={user}
            onClose={closeProfile}
            onUpdate={updateUser}
            onDelete={handleDelete}
          />
        )}
      </Modal>

      <Modal open={authWarn} onClose={closeAuthWarn}>
        <AuthWarnModal
          onLogin={() => {
            closeAuthWarn();
            setTimeout(goLogin, 50);
          }}
          onRegister={() => {
            closeAuthWarn();
            setTimeout(goRegister, 50);
          }}
        />
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}
    </>
  );
}
