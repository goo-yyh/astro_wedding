# Reusable components
- Header (layout, src/components/Header.astro): navigation and platform links; current branding, shadows and download behavior are tied to the earlier landing page.
- BaseLayout (layout, src/layouts/BaseLayout.astro): document shell, title and description props.
- Footer (layout, src/components/Footer.astro): site, contact and navigation props.
- AppQrPanel (basic, src/components/AppQrPanel.astro): platforms and compact flag; QR graphics and classes embedded.
The new calculator uses a new form and compact header; no shared DraftComponents are required for this standalone feature.
