// LogoutButton.jsx
import { useAuth0 } from "@auth0/auth0-react";
export default function LogoutButton() {
  const { logout, isAuthenticated } = useAuth0();
  if (!isAuthenticated) return null;
  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Logout
    </button>
  );
}
