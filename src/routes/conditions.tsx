import { createFileRoute } from '@tanstack/react-router';
import { listProducts } from '@/lib/products.functions';
import { InfoPage, metaFor } from '@/components/boutique/info-page';

export const Route = createFileRoute('/conditions')({
  head: () => metaFor('Conditions générales de vente', 'Conditions de vente des bijoux JAMILA JEWELRY : commande, prix, livraison et paiement.'),
  loader: () => listProducts(),
  component: () => <InfoPage products={Route.useLoaderData()} eyebrow="LÉGAL" title="Conditions générales de vente">
    <h2>Commande</h2><p>L’envoi du formulaire constitue une demande de commande. La vente est confirmée après vérification du modèle, de la dimension et de la disponibilité par notre équipe.</p>
    <h2>Prix</h2><p>Les prix sont indiqués en dirhams marocains (DH). Nous livrons partout au Maroc.</p>
    <h2>Paiement</h2><p>Le paiement s’effectue uniquement à la livraison, à la réception du colis.</p>
    <h2>Produits</h2><p>Nos bijoux sont en acier inoxydable. Les photos sont fournies à titre indicatif ; de légères variations de teinte peuvent exister.</p>
    <h2>Retours</h2><p>Les conditions de retour et d’échange sont détaillées sur la page Retours & échanges.</p>
  </InfoPage>,
});
