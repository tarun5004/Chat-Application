import { useAuth } from "../features/auth/AuthContext.jsx";

const DashboardPage = () => {
  const { logout, user } = useAuth();

  return (
    <main className="dashboard-page">
      <section className="dashboard-shell" aria-labelledby="dashboard-title">
        <div>
          <p className="eyebrow">Protected Area</p>
          <h1 id="dashboard-title">Welcome, {user?.name}</h1>
          <p>{user?.email}</p>
        </div>

        <button type="button" className="secondary-button" onClick={logout}>
          Logout
        </button>
      </section>
    </main>
  );
};

export default DashboardPage;
