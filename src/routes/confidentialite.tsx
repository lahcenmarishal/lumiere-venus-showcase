import { createFileRoute } from '@tanstack/react-router';
import { listProducts } from '@/lib/products.functions';
import { InfoPage, metaFor } from '@/components/boutique/info-page';

export const Route = createFileRoute('/confidentialite')({
  head: () => metaFor('Politique de confidentialité', 'Comment JAMILA JEWELRY utilise et protège vos informations personnelles.'),
  loader: () => listProducts(),
  component: () => <InfoPage products={Route.useLoaderData()} eyebrow="LÉGAL" title="Politique de confidentialité">
    <h2>Données collectées</h2><p>Lors d’une commande, nous recueillons votre nom, téléphone, ville, adresse et les articles choisis.</p>
    <h2>Utilisation</h2><p>Ces informations servent uniquement à traiter votre commande et organiser la livraison. Elles ne sont ni revendues ni accessibles aux autres visiteurs.</p>
    <h2>Paiement</h2><p>Aucune donnée de carte bancaire n’est collectée : le paiement se fait à la livraison.</p>
    <h2>Avis clients</h2><p>Les captures d’avis publiées sont anonymisées : noms, numéros et photos de profil sont masqués avant publication.</p>
    <h2>Vos droits</h2><p>Vous pouvez demander l’accès, la correction ou la suppression de vos données en nous contactant sur WhatsApp.</p>
  </InfoPage>,
});
