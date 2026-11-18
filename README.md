# Tampa Rent vs. Buy Calculator

React/Vite handoff for Jennifer Lohmeier's Tampa Rent vs. Buy landing page.

## Run locally
1. `npm install`
2. `npm run dev`

## Build
`npm run build`

## Production requirements
- Connect the lead form to the production CRM/backend (preferably KW Command workflow if supported).
- Pass calculator scenario with each lead.
- Capture `source`, `utm_source`, `utm_medium`, `utm_campaign`, and `utm_content` query parameters.
- Add required brokerage, REALTOR, Equal Housing Opportunity, privacy, consent, and other production disclosures.
- Add analytics for calculator interactions and successful lead submissions.
- Deploy under `/rent-vs-buy` or an equivalent path on the production domain.

## Calculator defaults
Rent $3,500; home $500,000; 20% down; 6.5% mortgage; 1.25% tax; $300 HOA; 0.90% homeowners insurance; $0 flood; 3% appreciation; 5 years.
