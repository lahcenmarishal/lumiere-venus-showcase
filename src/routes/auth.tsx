import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/boutique/brand-mark';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Connexion administrateur — JAMILA JEWELRY' },
    { name: 'description', content: 'Accès réservé à l’équipe JAMILA JEWELRY pour gérer la sélection et les commandes.' },
    { property: 'og:title', content: 'Connexion administrateur — JAMILA JEWELRY' },
    { property: 'og:description', content: 'Espace réservé à l’équipe JAMILA JEWELRY.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'robots', content: 'noindex' },
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [msg, setMsg] = useState('');
  const [pending, setPending] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const email = String(f.get('email')); const password = String(f.get('password'));
    setPending(true); setMsg('');
    if (mode === 'in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg('Email ou mot de passe incorrect.'); else navigate({ to: '/admin' });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth` } });
      setMsg(error ? error.message : 'Compte créé. Confirmez votre email, puis connectez-vous.');
    }
    setPending(false);
  }
  return <main className="admin-auth"><form className="admin-card admin-auth-card" onSubmit={submit}>
    <BrandMark className="admin-logo" label="JAMILA JEWELRY" />
    <h1>{mode === 'in' ? 'Espace administrateur' : 'Créer un compte'}</h1>
    <label>Email<input name="email" type="email" required autoComplete="email" /></label>
    <label>Mot de passe<input name="password" type="password" required minLength={8} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} /></label>
    {msg && <p className="admin-msg">{msg}</p>}
    <Button variant="couture" type="submit" disabled={pending}>{mode === 'in' ? 'SE CONNECTER' : 'CRÉER LE COMPTE'}</Button>
  </form></main>;
}
