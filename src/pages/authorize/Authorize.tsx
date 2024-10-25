import { Navigate } from "react-router-dom";

import { Button } from "@components/button";
import { useAuth } from "@hooks/auth";
import { redirectToAuth } from "@utils/auth";

export const Authorize = () => {
  const { loading, user } = useAuth();

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="section">
      <p className="text-center">Discover music in every language and find songs you'll love.</p>
      <Button onClick={redirectToAuth}>Log in with Spotify</Button>
    </section>
  );
};
