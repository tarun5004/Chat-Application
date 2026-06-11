import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { getErrorMessage, register: registerAccount } = useAuth();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setFocus,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setFocus("name");
  }, [setFocus]);

  const onSubmit = async (values) => {
    try {
      await registerAccount(values);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError("root", {
        message: getErrorMessage(error),
      });
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
        <div className="auth-copy">
          <p className="eyebrow">Real-Time Chat</p>
          <h1 id="register-title">Create account</h1>
          <p>Start with your identity. Real-time chat comes after auth is solid.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Name
            <input
              type="text"
              autoComplete="name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>

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
              autoComplete="new-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>

          {errors.root && <p className="form-error">{errors.root.message}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
