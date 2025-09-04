import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Login() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) loginWithRedirect();
  }, [isAuthenticated, loginWithRedirect]);

  return (
    <div
      className="page-80"
      style={{
        width: "80%",
        margin: "0 auto",
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Redirigiendo a Auth0…</h1>
        <p>Si no ocurre automáticamente, hacé click abajo.</p>
        <button onClick={() => loginWithRedirect()}>Ir a iniciar sesión</button>
      </div>
    </div>
  );
}
