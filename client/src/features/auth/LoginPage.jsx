import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { getErrorMessage, login } = useAuth();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setFocus,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setFocus("email");
  }, [setFocus]);

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError("root", {
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-copy">
          <p className="eyebrow">Real-Time Chat</p>
          <h1 id="login-title">Sign in</h1>
          <p>Continue to your conversations and account workspace.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              {...register("password", {
                required: "Password is required",
              })}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>

          {errors.root && <p className="form-error">{errors.root.message}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
