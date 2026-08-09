# TerraSync React + Supabase

A Vite + React farmer-management dashboard styled after the supplied TerraSync screenshot.

## Included

- Supabase Authentication: Sign In / Sign Up / Sign Out
- Authenticated farmer CRUD
- Farmer list in a readable responsive table
- Create Farmer modal
- Update Farmer modal
- Delete confirmation modal
- Search/filter
- Active/inactive status
- Dashboard summary cards
- TerraSync-style header, manager bar and tab navigation
- Inactive tabs are kept as placeholders so their content is hidden
- `index.html` is included and correctly points to `/src/main.jsx`
- `supabase-setup.sql` creates the table and authenticated-user RLS policies

## Supabase configuration

The project is already configured with the Supabase URL and anon key supplied in the request in:

`src/supabase.js`

The browser anon/publishable key is not a secret. Security must come from Supabase Authentication + Row Level Security.

## Database setup

1. Open your Supabase project.
2. Go to SQL Editor.
3. Run `supabase-setup.sql` if the `public.farmers` table and policies have not already been created.
4. In Authentication, create a user or use the Sign Up form in the app.
5. Make sure the email/password provider is enabled if you want email/password authentication.

## Run locally

Requirements: Node.js 18+ recommended.

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal, normally:

`http://localhost:5173`

## Production build

```bash
npm run build
npm run preview
```

## Important

Do not put a Supabase `service_role` key in this React project. Only the anon/publishable key belongs in browser code.

If your project already has stricter RLS requirements, replace the example policies in `supabase-setup.sql` with policies appropriate to your user/role model.
