<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the storefront at `/`, with reusable commerce dialogs in `src/components/boutique` and products stored in the `products` table (managed from `/admin`, admins granted via `user_roles`); this lets the range grow without rebuilding the layout.
- Submit guest orders through a validated TanStack server function using the publishable client with insert-only RLS; personal order data must never be publicly readable.
- Define all boutique styling and role colors in `src/styles.css` and use couture Button variants; this preserves a consistent fashion identity across every screen.

- Trust information must reflect actual payment methods and supplied customer feedback; this prevents misleading commerce claims.
- Keep illustrative reviews and proposed return terms in a separate demonstration dataset with explicit visible disclaimers; this prevents seed content from being mistaken for verified commercial claims.
- Keep generated jewelry inspirations in a separate non-orderable presentation component when the product catalog is empty; this previews the brand without inventing saleable stock or prices.

- Public pages except product detail share `SiteShell` (src/components/boutique/site-shell.tsx) for header, footer and cart; each section remains its own route so pages stay distinct and SEO-indexable.
- Homepage products come only from `products.featured` ordered by `featured_order` (max 8); collections come from the `categories` table matched to `products.category` by name; brand texts live in `site_content`; reviews in `testimonials` (published flag) — all admin-managed so no static fake data.
- Admin-uploaded site images reuse the private `product-images` bucket with long-lived signed URLs because public buckets are blocked in this workspace.
- Product images are an ordered gallery: index 0 is the cover and index 1 is the card hover image; this keeps admin ordering, cards and product pages consistent without duplicate fields.
- Route all product additions through the shared cart store and mount its confirmation within CartDialog; this keeps catalog and standalone detail-page cart behavior consistent.
- Product detail URLs remain standalone headerless and footerless pages with a centered two-column presentation, scrollable desktop details and the shared CartDialog mounted directly; this preserves deep links and commerce behavior while matching the reference sheet.
- The featured homepage selection uses Embla with touch gestures and accessible controls; this preserves admin ordering while avoiding custom carousel physics.
- Server/CDN caching: public reads cached 60s in memory and HTML at the CDN (s-maxage=60, SWR); admin edits appear within ~1 min.
- Store category editorials and the logo-based social preview under public images; this keeps database image paths admin-managed and sharing assets accessible on every deployment without Lovable-only CDN URLs.
