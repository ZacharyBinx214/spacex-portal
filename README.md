# AWC Supply Portal — SpaceX

React-based inventory portal for SpaceX, built with Vite and deployable to GitHub Pages.

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173/spacex-portal/

## Deploy to GitHub Pages

### First-time setup

1. Create a repo named `spacex-portal` on GitHub
2. In `vite.config.js`, confirm `base: '/spacex-portal/'` matches your repo name
3. In `package.json`, update the deploy script if your repo name differs

```bash
npm install
npm run deploy
```

Your portal will be live at:
`https://YOUR_USERNAME.github.io/spacex-portal/`

### Subsequent deploys

```bash
npm run deploy
```

## Data Loading

The portal attempts to fetch the Excel file from SharePoint on load.
If SharePoint authentication blocks the request (common with corporate tenants),
a banner will appear prompting you to load the file manually.

**Manual load:** Click "↑ Load File" in the header or use the banner button,
then select the exported Excel file. The portal parses it entirely in the browser -
no data is sent anywhere.

## Data Source Format

The portal expects an Excel file with a sheet named `Stacked2` containing:

| Column | Description |
|--------|-------------|
| Category Header | Product series / brand |
| Model Code: | AWC model number |
| Product Description | Full description |
| Size | Valve size (e.g. 1/2") |
| Port | Port type (FULL, STANDARD, REDUCED...) |
| Body | Body material (Carbon, SS) |
| Seat | Seat material |
| OH Jax Network | Network available quantity |
| OH Jacksonville | Local Jacksonville quantity |

## Updating the SharePoint URL

Edit `src/utils/dataParser.js` and update `SHAREPOINT_URL` to your
direct-download SharePoint link.

## Project Structure

```
src/
  components/
    Header.jsx / .module.css
    StatsBar.jsx / .module.css
    Slicers.jsx / .module.css
    InventoryTable.jsx / .module.css
    CartPanel.jsx / .module.css
    Configurator.jsx / .module.css
    DataLoadBanner.jsx / .module.css
  hooks/
    useInventory.js
    useCart.js
  utils/
    dataParser.js
  App.jsx / App.module.css
  main.jsx
  index.css
```
