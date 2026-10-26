import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error(`Could not load users (${response.status}).`);
  }

  const data = await response.json();
  return Array.isArray(data.users) ? data.users : [];
}

function getUserName(user) {
  return user.name || 'Unnamed user';
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function refreshUsers() {
    setError('');
    setIsLoading(true);

    try {
      setUsers(await getUsers());
    } catch (loadError) {
      setError(loadError.message || 'Something went wrong while loading users.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshUsers();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Could not add user (${response.status}).`);
      }

      await response.json();
      setName('');
      setEmail('');
      await refreshUsers();
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong while adding the user.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="/" aria-label="People home">
          <span className="wordmark-mark" aria-hidden="true">P</span>
          <span>people<span className="wordmark-period">.</span></span>
        </a>
        <span className="topbar-label">USER DIRECTORY</span>
      </header>

      <section className="content" aria-labelledby="page-title">
        <div className="intro">
          <p className="eyebrow">YOUR TEAM, IN ONE PLACE</p>
          <h1 id="page-title">People</h1>
          <p className="intro-copy">Keep track of the people you work with.</p>
        </div>

        <div className="workspace">
          <section className="form-panel" aria-labelledby="form-title">
            <div className="panel-heading">
              <span className="section-index">01</span>
              <div>
                <h2 id="form-title">Add someone new</h2>
                <p>Enter their details below.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <button className="submit-button" type="submit" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Adding user...' : 'Add user'}</span>
                {!isSubmitting && <span aria-hidden="true">↗</span>}
              </button>
            </form>
            {error && <p className="error-message" role="alert">{error}</p>}
          </section>

          <section className="list-panel" aria-labelledby="list-title">
            <div className="list-heading">
              <div className="panel-heading">
                <span className="section-index">02</span>
                <div>
                  <h2 id="list-title">Directory</h2>
                  <p>Everyone on your list.</p>
                </div>
              </div>
              {!isLoading && !error && (
                <span className="user-count">{users.length} {users.length === 1 ? 'PERSON' : 'PEOPLE'}</span>
              )}
            </div>

            {isLoading ? (
              <p className="list-message" role="status">Loading people...</p>
            ) : error && users.length === 0 ? (
              <p className="list-message">Your directory couldn’t load. Check the API and try again.</p>
            ) : users.length === 0 ? (
              <p className="list-message">No people yet. Add the first person using the form.</p>
            ) : (
              <ul className="user-list">
                {users.map((user, index) => {
                  const displayName = getUserName(user);
                  return (
                    <li className="user-row" key={user.id ?? user._id ?? `${user.email}-${index}`}>
                      <span className="avatar" aria-hidden="true">{getInitials(displayName) || '?'}</span>
                      <span className="user-details">
                        <span className="user-name">{displayName}</span>
                        <span className="user-email">{user.email}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
        <footer className="page-footer">A little more connected.</footer>
      </section>
    </main>
  );
}