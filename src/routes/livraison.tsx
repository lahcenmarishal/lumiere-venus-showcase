import { createFileRoute } from '@tanstack/react-router';
import { listProducts } from '@/lib/products.functions';
import { InfoPage, metaFor } from '@/components/boutique/info-page';

export const Route = createFileRoute('/livraison')({
  head: () => metaFor('Livraison', 'Livraison partout au Maroc et paiement à la livraison chez JAMILA JEWELRY.'),
  loader: () => listProducts(),
  component: () => <InfoPage products={Route.useLoaderData()} eyebrow="INFORMATIONS" title="Livraison" intro="Livraison partout au Maroc, sans minimum d’achat.">
    <h2>Zones et frais</h2><p>Nous livrons dans toutes les villes du Maroc. Les frais de livraison sont confirmés avec notre équipe lors de la confirmation de votre commande.</p>
    <h2>Confirmation</h2><p>Après votre commande, notre équipe vous contacte par téléphone ou WhatsApp pour confirmer l’adresse, le modèle et la disponibilité avant l’envoi.</p>
    <h2>Délais</h2><p>Le délai de livraison vous est communiqué lors de la confirmation de votre commande.</p>
    <h2>Paiement</h2><p>Vous payez en espèces à la réception de votre colis. Aucun paiement en ligne et aucune donnée bancaire ne sont demandés sur ce site.</p>
  </InfoPage>,
});
