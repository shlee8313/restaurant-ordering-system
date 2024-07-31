This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

```
restaurant-ordering-system
├─ .env
├─ .git
│  ├─ COMMIT_EDITMSG
│  ├─ config
│  ├─ description
│  ├─ FETCH_HEAD
│  ├─ HEAD
│  ├─ hooks
│  │  ├─ applypatch-msg.sample
│  │  ├─ commit-msg.sample
│  │  ├─ fsmonitor-watchman.sample
│  │  ├─ post-update.sample
│  │  ├─ pre-applypatch.sample
│  │  ├─ pre-commit.sample
│  │  ├─ pre-merge-commit.sample
│  │  ├─ pre-push.sample
│  │  ├─ pre-rebase.sample
│  │  ├─ pre-receive.sample
│  │  ├─ prepare-commit-msg.sample
│  │  ├─ push-to-checkout.sample
│  │  └─ update.sample
│  ├─ index
│  ├─ info
│  │  └─ exclude
│  ├─ logs
│  │  ├─ HEAD
│  │  └─ refs
│  │     └─ heads
│  │        └─ main
│  ├─ objects
│  │  ├─ 18
│  │  │  └─ 2cd5e1b7b0f624758c8b796521d0e5584cecbe
│  │  ├─ 1f
│  │  │  └─ d25029eee69874349df729e52deadbc6b9ebe2
│  │  ├─ 2a
│  │  │  └─ 2e4b3bf8ba1c86d96fc2f5786597ad77a0e5e9
│  │  ├─ 2d
│  │  │  └─ 98d33382d3842f086d9c6b7d0d408d124f6f18
│  │  ├─ 33
│  │  │  └─ ad091d26d8a9dc95ebdf616e217d985ec215b8
│  │  ├─ 51
│  │  │  └─ 74b28c565c285e3e312ec5178be64fbeca8398
│  │  ├─ 53
│  │  │  └─ 3ec19e11b548f8ad6f26d6d198bce8e7cff106
│  │  ├─ 55
│  │  │  └─ f69855c3d110f503acf2e4859aa9bb9f7119d4
│  │  ├─ 71
│  │  │  └─ 8d6fea4835ec2d246af9800eddb7ffb276240c
│  │  ├─ 76
│  │  │  └─ 7719fc4fba59345ae29e29159c9aff270f5819
│  │  ├─ 8c
│  │  │  └─ 4d1b21f11f2a8909c644a8a818e99597963450
│  │  ├─ 8f
│  │  │  └─ 322f0d8f49570a594b865ef8916c428a01afc1
│  │  ├─ c6
│  │  │  └─ 58b3e80ff3110d4fc79140fc147f3cfaed3a1f
│  │  ├─ c9
│  │  │  └─ 3f80617d1d16516dc2a27bbae49c9d9b7138e0
│  │  ├─ d2
│  │  │  └─ f84222734f27b623d1c80dda3561b04d1284af
│  │  ├─ df
│  │  │  └─ 94bc88726134214ff00876b79d6c531194f614
│  │  ├─ e5
│  │  │  └─ f733efcbeee50f6a7e0d1a3e7d1d795a52dec6
│  │  ├─ fd
│  │  │  └─ 81e885836d815b8019694a910a93d86a43cb66
│  │  ├─ info
│  │  └─ pack
│  └─ refs
│     ├─ heads
│     │  └─ main
│     └─ tags
├─ .gitignore
├─ app
│  ├─ admin
│  │  ├─ layout.js
│  │  └─ page.js
│  ├─ api
│  │  ├─ menu
│  │  │  └─ route.js
│  │  ├─ orders
│  │  │  └─ route.js
│  │  ├─ restaurant
│  │  │  ├─ login
│  │  │  │  └─ route.js
│  │  │  ├─ profile
│  │  │  │  └─ route.js
│  │  │  ├─ register
│  │  │  │  └─ route.js
│  │  │  └─ route.js
│  │  ├─ socket.js
│  │  ├─ tables
│  │  │  └─ route.js
│  │  ├─ test-db
│  │  │  └─ route.js
│  │  └─ user
│  │     ├─ login
│  │     │  └─ route.js
│  │     ├─ profile
│  │     │  └─ route.js
│  │     └─ register
│  │        └─ register.js
│  ├─ components
│  │  ├─ AdminTable.js
│  │  ├─ Cart.js
│  │  ├─ LoadingSpinner.js
│  │  ├─ MenuList.js
│  │  └─ nav
│  │     ├─ SideNav.js
│  │     └─ TobBar.js
│  ├─ data
│  │  └─ menu.json
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.js
│  ├─ lib
│  │  ├─ jwt.js
│  │  ├─ mongodb.js
│  │  └─ mongoose.js
│  ├─ models
│  │  ├─ Menu.js
│  │  ├─ Order.js
│  │  ├─ Restaurant.js
│  │  ├─ Table.js
│  │  └─ User.js
│  ├─ page.js
│  ├─ restaurant
│  │  ├─ login
│  │  │  └─ page.js
│  │  └─ register
│  │     └─ page.js
│  ├─ store
│  │  ├─ orderStore.js
│  │  └─ useAuthStore.js
│  ├─ user
│  │  ├─ login
│  │  │  └─ page.js
│  │  └─ register
│  │     └─ page.js
│  └─ [restaurantId]
│     └─ [tableId]
│        └─ page.js
├─ jsconfig.json
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ next.svg
│  └─ vercel.svg
├─ README.md
└─ tailwind.config.js

```
```
restaurant-ordering-system
├─ .env
├─ .git
│  ├─ COMMIT_EDITMSG
│  ├─ config
│  ├─ description
│  ├─ FETCH_HEAD
│  ├─ HEAD
│  ├─ hooks
│  │  ├─ applypatch-msg.sample
│  │  ├─ commit-msg.sample
│  │  ├─ fsmonitor-watchman.sample
│  │  ├─ post-update.sample
│  │  ├─ pre-applypatch.sample
│  │  ├─ pre-commit.sample
│  │  ├─ pre-merge-commit.sample
│  │  ├─ pre-push.sample
│  │  ├─ pre-rebase.sample
│  │  ├─ pre-receive.sample
│  │  ├─ prepare-commit-msg.sample
│  │  ├─ push-to-checkout.sample
│  │  └─ update.sample
│  ├─ index
│  ├─ info
│  │  └─ exclude
│  ├─ logs
│  │  ├─ HEAD
│  │  └─ refs
│  │     └─ heads
│  │        └─ main
│  ├─ objects
│  │  ├─ 18
│  │  │  └─ 2cd5e1b7b0f624758c8b796521d0e5584cecbe
│  │  ├─ 1f
│  │  │  └─ d25029eee69874349df729e52deadbc6b9ebe2
│  │  ├─ 2a
│  │  │  └─ 2e4b3bf8ba1c86d96fc2f5786597ad77a0e5e9
│  │  ├─ 2d
│  │  │  └─ 98d33382d3842f086d9c6b7d0d408d124f6f18
│  │  ├─ 33
│  │  │  └─ ad091d26d8a9dc95ebdf616e217d985ec215b8
│  │  ├─ 51
│  │  │  └─ 74b28c565c285e3e312ec5178be64fbeca8398
│  │  ├─ 53
│  │  │  └─ 3ec19e11b548f8ad6f26d6d198bce8e7cff106
│  │  ├─ 55
│  │  │  └─ f69855c3d110f503acf2e4859aa9bb9f7119d4
│  │  ├─ 71
│  │  │  └─ 8d6fea4835ec2d246af9800eddb7ffb276240c
│  │  ├─ 76
│  │  │  └─ 7719fc4fba59345ae29e29159c9aff270f5819
│  │  ├─ 8c
│  │  │  └─ 4d1b21f11f2a8909c644a8a818e99597963450
│  │  ├─ 8f
│  │  │  └─ 322f0d8f49570a594b865ef8916c428a01afc1
│  │  ├─ c6
│  │  │  └─ 58b3e80ff3110d4fc79140fc147f3cfaed3a1f
│  │  ├─ c9
│  │  │  └─ 3f80617d1d16516dc2a27bbae49c9d9b7138e0
│  │  ├─ d2
│  │  │  └─ f84222734f27b623d1c80dda3561b04d1284af
│  │  ├─ df
│  │  │  └─ 94bc88726134214ff00876b79d6c531194f614
│  │  ├─ e5
│  │  │  └─ f733efcbeee50f6a7e0d1a3e7d1d795a52dec6
│  │  ├─ fd
│  │  │  └─ 81e885836d815b8019694a910a93d86a43cb66
│  │  ├─ info
│  │  └─ pack
│  └─ refs
│     ├─ heads
│     │  └─ main
│     └─ tags
├─ .gitignore
├─ app
│  ├─ admin
│  │  ├─ layout.js
│  │  └─ order
│  │     └─ page.js
│  ├─ api
│  │  ├─ menu
│  │  │  └─ route.js
│  │  ├─ orders
│  │  │  └─ route.js
│  │  ├─ restaurant
│  │  │  ├─ login
│  │  │  │  └─ route.js
│  │  │  ├─ profile
│  │  │  │  └─ route.js
│  │  │  ├─ register
│  │  │  │  └─ route.js
│  │  │  └─ route.js
│  │  ├─ socket.js
│  │  ├─ tables
│  │  │  └─ route.js
│  │  ├─ test-db
│  │  │  └─ route.js
│  │  └─ user
│  │     ├─ login
│  │     │  └─ route.js
│  │     ├─ profile
│  │     │  └─ route.js
│  │     └─ register
│  │        └─ register.js
│  ├─ components
│  │  ├─ AdminTable.js
│  │  ├─ Cart.js
│  │  ├─ LoadingSpinner.js
│  │  ├─ MenuList.js
│  │  └─ nav
│  │     ├─ SideNav.js
│  │     └─ TobBar.js
│  ├─ data
│  │  └─ menu.json
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.js
│  ├─ lib
│  │  ├─ jwt.js
│  │  ├─ mongodb.js
│  │  └─ mongoose.js
│  ├─ models
│  │  ├─ Menu.js
│  │  ├─ Order.js
│  │  ├─ Restaurant.js
│  │  ├─ Table.js
│  │  └─ User.js
│  ├─ page.js
│  ├─ restaurant
│  │  ├─ login
│  │  │  └─ page.js
│  │  └─ register
│  │     └─ page.js
│  ├─ store
│  │  ├─ orderStore.js
│  │  └─ useAuthStore.js
│  ├─ user
│  │  ├─ login
│  │  │  └─ page.js
│  │  └─ register
│  │     └─ page.js
│  └─ [restaurantId]
│     └─ [tableId]
│        └─ page.js
├─ jsconfig.json
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ next.svg
│  └─ vercel.svg
├─ README.md
└─ tailwind.config.js

```
```
restaurant-ordering-system
├─ .env
├─ .git
│  ├─ COMMIT_EDITMSG
│  ├─ config
│  ├─ description
│  ├─ FETCH_HEAD
│  ├─ HEAD
│  ├─ hooks
│  │  ├─ applypatch-msg.sample
│  │  ├─ commit-msg.sample
│  │  ├─ fsmonitor-watchman.sample
│  │  ├─ post-update.sample
│  │  ├─ pre-applypatch.sample
│  │  ├─ pre-commit.sample
│  │  ├─ pre-merge-commit.sample
│  │  ├─ pre-push.sample
│  │  ├─ pre-rebase.sample
│  │  ├─ pre-receive.sample
│  │  ├─ prepare-commit-msg.sample
│  │  ├─ push-to-checkout.sample
│  │  └─ update.sample
│  ├─ index
│  ├─ info
│  │  └─ exclude
│  ├─ logs
│  │  ├─ HEAD
│  │  └─ refs
│  │     └─ heads
│  │        └─ main
│  ├─ objects
│  │  ├─ 18
│  │  │  └─ 2cd5e1b7b0f624758c8b796521d0e5584cecbe
│  │  ├─ 1f
│  │  │  └─ d25029eee69874349df729e52deadbc6b9ebe2
│  │  ├─ 2a
│  │  │  └─ 2e4b3bf8ba1c86d96fc2f5786597ad77a0e5e9
│  │  ├─ 2d
│  │  │  └─ 98d33382d3842f086d9c6b7d0d408d124f6f18
│  │  ├─ 33
│  │  │  └─ ad091d26d8a9dc95ebdf616e217d985ec215b8
│  │  ├─ 51
│  │  │  └─ 74b28c565c285e3e312ec5178be64fbeca8398
│  │  ├─ 53
│  │  │  └─ 3ec19e11b548f8ad6f26d6d198bce8e7cff106
│  │  ├─ 55
│  │  │  └─ f69855c3d110f503acf2e4859aa9bb9f7119d4
│  │  ├─ 71
│  │  │  └─ 8d6fea4835ec2d246af9800eddb7ffb276240c
│  │  ├─ 76
│  │  │  └─ 7719fc4fba59345ae29e29159c9aff270f5819
│  │  ├─ 8c
│  │  │  └─ 4d1b21f11f2a8909c644a8a818e99597963450
│  │  ├─ 8f
│  │  │  └─ 322f0d8f49570a594b865ef8916c428a01afc1
│  │  ├─ c6
│  │  │  └─ 58b3e80ff3110d4fc79140fc147f3cfaed3a1f
│  │  ├─ c9
│  │  │  └─ 3f80617d1d16516dc2a27bbae49c9d9b7138e0
│  │  ├─ d2
│  │  │  └─ f84222734f27b623d1c80dda3561b04d1284af
│  │  ├─ df
│  │  │  └─ 94bc88726134214ff00876b79d6c531194f614
│  │  ├─ e5
│  │  │  └─ f733efcbeee50f6a7e0d1a3e7d1d795a52dec6
│  │  ├─ fd
│  │  │  └─ 81e885836d815b8019694a910a93d86a43cb66
│  │  ├─ info
│  │  └─ pack
│  └─ refs
│     ├─ heads
│     │  └─ main
│     └─ tags
├─ .gitignore
├─ app
│  ├─ admin
│  │  ├─ layout.js
│  │  └─ order
│  │     └─ page.js
│  ├─ api
│  │  ├─ menu
│  │  │  └─ route.js
│  │  ├─ orders
│  │  │  └─ route.js
│  │  ├─ restaurant
│  │  │  ├─ login
│  │  │  │  └─ route.js
│  │  │  ├─ profile
│  │  │  │  └─ route.js
│  │  │  ├─ register
│  │  │  │  └─ route.js
│  │  │  └─ route.js
│  │  ├─ socket.js
│  │  ├─ tables
│  │  │  └─ route.js
│  │  ├─ test-db
│  │  │  └─ route.js
│  │  └─ user
│  │     ├─ login
│  │     │  └─ route.js
│  │     ├─ profile
│  │     │  └─ route.js
│  │     └─ register
│  │        └─ register.js
│  ├─ components
│  │  ├─ AdminTable.js
│  │  ├─ Cart.js
│  │  ├─ LoadingSpinner.js
│  │  ├─ MenuList.js
│  │  └─ nav
│  │     ├─ SideNav.js
│  │     └─ TobBar.js
│  ├─ data
│  │  └─ menu.json
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.js
│  ├─ lib
│  │  ├─ jwt.js
│  │  ├─ mongodb.js
│  │  └─ mongoose.js
│  ├─ models
│  │  ├─ Menu.js
│  │  ├─ Order.js
│  │  ├─ Restaurant.js
│  │  ├─ Table.js
│  │  └─ User.js
│  ├─ page.js
│  ├─ restaurant
│  │  ├─ login
│  │  │  └─ page.js
│  │  └─ register
│  │     └─ page.js
│  ├─ store
│  │  ├─ orderStore.js
│  │  └─ useAuthStore.js
│  ├─ user
│  │  ├─ login
│  │  │  └─ page.js
│  │  └─ register
│  │     └─ page.js
│  └─ [restaurantId]
│     └─ [tableId]
│        └─ page.js
├─ jsconfig.json
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ public
│  ├─ next.svg
│  └─ vercel.svg
├─ README.md
└─ tailwind.config.js

```