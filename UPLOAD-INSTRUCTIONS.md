# Upload instructions

This ZIP is a complete replacement copy of the Exact Business Days GitHub repository.

1. Download and unzip the package.
2. Open the `exactbusinessdays` repository on GitHub.
3. Upload the unzipped files and folders into the repository root. Keep the folder structure exactly as shown, including `.github`, `functions`, `public`, `scripts`, and `src`.
4. When GitHub asks about duplicate files, replace the existing versions.
5. Commit the upload directly to `main` with the message: `Expand holiday coverage and SEO data tools`.
6. Open Cloudflare Pages and wait for the GitHub-triggered deployment to finish successfully.
7. Check these live pages:
   - `https://exactbusinessdays.com/`
   - `https://exactbusinessdays.com/us/state-business-days/`
   - `https://exactbusinessdays.com/germany/working-days/`
   - `https://exactbusinessdays.com/japan/business-days/`
   - `https://exactbusinessdays.com/data/business-days-2026-2027/`
8. In Google Search Console, open **Sitemaps** and submit `https://exactbusinessdays.com/sitemap.xml` again.
9. Do not start validation for an old redirect/canonical report merely because redirected URLs remain excluded. Redirected duplicates are expected to be non-indexed. Inspect a URL only if its final canonical page is not indexable.

The GitHub workflow waits for Cloudflare, then submits the live sitemap URLs to IndexNow for Bing and participating engines. Google still relies on normal crawling and the sitemap.
