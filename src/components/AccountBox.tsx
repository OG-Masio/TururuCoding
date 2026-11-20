import { useEffect, useRef } from 'react';
import { logout, renderGoogleButton, useAuth } from '../lib/auth';

export default function AccountBox() {
  const { user, loginAvailable } = useAuth();
  const btn = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!user && loginAvailable && btn.current) renderGoogleButton(btn.current);
  }, [user, loginAvailable]);

  if (user)
    return (
      <div className="account">
        {user.picture && <img src={user.picture} alt="" referrerPolicy="no-referrer" />}
        <span className="account-name">{user.name.split(' ')[0]}</span>
        <button className="btn ghost small" onClick={logout}>Log out</button>
      </div>
    );
  if (!loginAvailable) return <div className="account muted small-text" title="Progress is saved on this device">Saved on this device</div>;
  return <div className="account" ref={btn} />;
}
