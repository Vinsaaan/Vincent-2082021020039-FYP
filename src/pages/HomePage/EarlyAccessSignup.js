import "./EarlyAccessSignup.css";
import { useNavigate } from "react-router-dom";

const EarlyAccessSignup = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/signup"); // Redirect to signup page
  };

  return (
    <section className="early-access-section">
      <div className="container">
        <h1>Get early access today</h1>
        <p>
          Sign up in just a minute to enjoy unrestricted access to all our
          features for free. If you have any questions, our support team would
          be happy to help you.
        </p>
        <form onSubmit={handleSubmit} className="home-signup-form">
          <button type="submit" className="home-btn-signup">
            Sign Up For Free
          </button>
        </form>
      </div>
    </section>
  );
};

export default EarlyAccessSignup;
