import { createFileRoute, Link } from '@tanstack/react-router';
import { listProducts } from '@/lib/products.functions';
import { InfoPage, metaFor } from '@/components/boutique/info-page';
import { returnExamples } from '@/data/trust-examples';

export const Route = createFileRoute('/retours')({
  head: () => metaFor('Retours & échanges', 'Comment demander un retour ou un échange auprès de JAMILA JEWELRY.'),
  loader: () => listProducts(),
  component: () => <InfoPage products={Route.useLoaderData()} eyebrow="INFORMATIONS" title="Retours & échanges" intro="Une demande sur WhatsApp avec votre référence de commande suffit.">
    <p className="return-example-notice">Proposition de politique de retour, en attente de confirmation par la boutique. Ces conditions ne constituent pas encore un engagement commercial.</p>
    <ol className="return-examples">{returnExamples.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>)}</ol>
    <p>Pour toute demande, <Link to="/contact">contactez-nous</Link> en indiquant votre référence de commande.</p>
  </InfoPage>,
});
