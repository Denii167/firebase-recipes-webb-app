import { useState } from "react";
import FirebaseAuthService from "../FirebaseAuthservice";

function LoginForm({ existingUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await FirebaseAuthService.loginUser(username, password);
      setUsername("");
      setPassword("");
    } catch (error) {
      alert(error.message);
    }
  }
  async function handleSendResetPasswordEmail() {
    if (!username) {
      alert("Missing username!");
      return;
    }

    try {
      await FirebaseAuthService.sendPasswordResetEmail(username);
      alert("Sent the password reset email");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleLoginWithGoogle() {
    try {
      await FirebaseAuthService.loginWithGoogle();
    } catch (error) {
      alert(error.message);
    }
  }

  function handleLogout() {
    FirebaseAuthService.logoutUser();
  }

  return (
    <div className="login-form-container">
      {existingUser ? (
        <div className="row">
          <h3>Welcome, {existingUser.email}</h3>
          <button
            type="button"
            className="primary-button"
            onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <label className="input-label login-label">
            Username (email):
            <input
              type="email"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-text"
              autoComplete="username"
            />
          </label>
          <label className="input-label login-label">
            Password:
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-text"
              autoComplete="current-password"
            />
          </label>
          <div className="button-box">
            <button type="submit" className="primary-button">
              Login
            </button>

            <button
              type="button"
              onClick={handleSendResetPasswordEmail}
              className="primary-button">
              Reset Password
            </button>

            <button
              type="button"
              onClick={handleLoginWithGoogle}
              className="primary-button">
              Login with Google
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default LoginForm;
