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
