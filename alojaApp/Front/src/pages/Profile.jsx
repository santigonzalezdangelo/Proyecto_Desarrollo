import { useAuth0 } from "@auth0/auth0-react";

export default function Profile() {
  const { user } = useAuth0();
  if (!user) return null;
  return (
    <div style={{ width: "80%", margin: "0 auto" }}>
      <h1>Perfil</h1>
      <img src={user.picture} alt={user.name} width={64} height={64} />
      <p>{user.name}</p>
      <p>{user.email}</p>
    </div>
  );
}
