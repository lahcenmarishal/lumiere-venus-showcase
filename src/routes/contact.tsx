import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listProducts } from '@/lib/products.functions';
import { getSiteData } from '@/lib/site.functions';
import { SiteShell, PageHero } from '@/components/boutique/site-shell';
import { metaFor } from '@/components/boutique/info-page';
import { WhatsAppIcon } from '@/components/boutique/commerce-dialogs';

export const Route = createFileRoute('/contact')({
  head: () => metaFor('Contact', 'Contactez JAMILA JEWELRY sur WhatsApp pour toute question sur nos bijoux ou votre commande.'),
  loader: async () => { const [products, site] = await Promise.all([listProducts(), getSiteData()]); return { products, site }; },
  component: Contact,
});

function Contact() {
  const { products, site } = Route.useLoaderData();
  const wa = site.content.contact_whatsapp || '212717055482';
  const display = wa.replace(/^212/, '0').replace(/(\d{2})(?=\d)/g, '$1 ');
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const msg = `Bonjour JAMILA JEWELRY, je suis ${f.get('name')}.\n${f.get('message')}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener'); setSent(true);
  }
  return <SiteShell products={products}>
    <PageHero eyebrow="À VOTRE ÉCOUTE" title="Contactez-nous" intro="Une question sur un bijou, une dimension ou votre commande ? Nous vous répondons avec plaisir."/>
    <section className="site-width contact-grid">
      <div className="contact-info">
        <div><WhatsAppIcon/><h3>WhatsApp</h3><p><a href={`https://wa.me/${wa}`} target="_blank" rel="noopener">{display}</a></p></div>
        <div><Phone/><h3>Téléphone</h3><p><a href={`tel:+${wa}`}>{display}</a></p></div>
        {site.content.contact_hours && <div><Clock/><h3>Horaires</h3><p>{site.content.contact_hours}</p></div>}
        <div><MapPin/><h3>Livraison</h3><p>Partout au Maroc.</p></div>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <h2>Écrivez-nous</h2><p>Votre message s’ouvrira dans WhatsApp, prêt à être envoyé.</p>
        <label>Votre nom<input name="name" required minLength={2} maxLength={80}/></label>
        <label>Votre message<textarea name="message" required minLength={5} maxLength={1000} rows={5}/></label>
        <Button variant="couture" type="submit"><WhatsAppIcon/> ENVOYER SUR WHATSAPP</Button>
        {sent && <p className="detail-note">WhatsApp s’est ouvert : il ne reste qu’à envoyer votre message.</p>}
      </form>
    </section>
  </SiteShell>;
}
