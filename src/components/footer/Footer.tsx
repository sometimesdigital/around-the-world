import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer translate="no">
      <Link to="/">Around the World</Link> · {BUILD_DATE}
    </footer>
  );
};
