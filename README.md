# 🚀 Modern Web Starter

This project is a ready-made, flexible and scalable starter template for developing modern web applications. It is equipped with powerful technologies such as TypeScript, Next.js and Prisma.

## ✨ Features

- ⚡️ Next.js based SSR and static page support
- 🎨 Customizable design with Tailwind CSS
- 🔐 Powerful data modeling with Prisma
- 🧩 Modular file structure
- ✅ Code quality with ESLint + Prettier
- 🐳 Portable structure with Docker support

## 🚀 Getting Started

Node.js and one of the package managers (npm, yarn, pnpm, bun) must be installed to run the project.

## 🐳 Running with Docker

If you have Docker installed, you can run the application in the container with the following commands:

```bash
docker-compose up --build
```

### Start Development Server

```bash
# first install requirements
npm i
# prisma
npm i prisma
npx prisma init
npx prisma migrate dev --name init  # You can change the "init" part to whatever you want to name it
npx prisma studio # You can open the localhost page in your browser and see the tables in the db
# run 
npm run dev # You can open the localhost page in your browser
```

You can see the application by opening [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ File Structure

- `src/` – Application components and pages
- `src/app/` – Next.js page router directory
- `prisma/` – Database schema and migration files
- `public/` – Static files

## ⚙️ Configuration Files

- `tsconfig.json` – TypeScript configuration
- `tailwind.config.ts` – Tailwind CSS configuration
- `next.config.mjs` – Next.js custom settings
- `.eslintrc.json` – Linter rules

## 💬 Contributors

<div style="display: flex;">
  <a href="https://github.com/BatuhanARK" >
    <img src="https://github.com/BatuhanARK.png" width="100" height="100" style="border-radius: 50%; object-fit: cover;" />
    <strong>&nbsp;</strong>
  </a>
  
  <a href="https://github.com/ceyda125" >
    <img src="https://github.com/ceyda125.png" width="100" height="100" style="border-radius: 50%; object-fit: cover;" />
    <strong>&nbsp;</strong>
  </a>

  <a href="https://github.com/sldrdm" >
    <img src="https://github.com/sldrdm.png" width="100" height="100" style="border-radius: 50%; object-fit: cover;" />
  </a>
</div>

[@BatuhanARK](https://github.com/BatuhanARK) &nbsp;&nbsp;[@ceyda125](https://github.com/ceyda125) &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[@sldrdm](https://github.com/sldrdm)

---

🛡️ This project was developed as part of a school assignment.