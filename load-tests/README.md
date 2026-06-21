# eShop Catalog API Load Testing

Minimal guide for running the Catalog API k6 scenarios.

## Prerequisites

1. Install k6: https://k6.io/docs/getting-started/installation/
2. Start eShop AppHost:
   ```powershell
   dotnet run --project src/eShop.AppHost/eShop.AppHost.csproj
   ```
3. Use the Catalog API base URL (usually http://localhost:5222)

## Scenarios

### Browse (`catalog-browse.js`)
Purpose: list pagination baseline.

```powershell
k6 run catalog-browse.js -e BASE_URL=http://localhost:5222
```

### Search (`catalog-search.js`)
Purpose: catalog search endpoint load.

```powershell
k6 run catalog-search.js -e BASE_URL=http://localhost:5222
```

### Realistic (`catalog-realistic.js`)
Purpose: mixed traffic (browse + search + item details).

```powershell
k6 run catalog-realistic.js -e BASE_URL=http://localhost:5222
```
