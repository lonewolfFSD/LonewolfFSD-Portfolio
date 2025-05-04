import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC4J83iGH8x7qQLil5rXtBW0wowSWbVAJE",
  authDomain: "lonewolffsd-15f1f.firebaseapp.com",
  projectId: "lonewolffsd-15f1f",
  storageBucket: "lonewolffsd-15f1f.firebasestorage.app",
  messagingSenderId: "834465885635",
  appId: "1:834465885635:web:2fcee054ea4a2b80f8a176",
  measurementId: "G-QKL0BZ5B0J"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function generateSitemap() {
  const baseUrl = 'https://lonewolffsd.in'; 

  const ticketsSnapshot = await getDocs(collection(db, 'tickets'));
  const chatRoutes = ticketsSnapshot.docs.map(doc => `/chat/${doc.id}`);

  const urls = chatRoutes.map(route => `
    <url>
      <loc>${baseUrl}${route}</loc>
      <changefreq>daily</changefreq>
      <priority>0.7</priority>
    </url>`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${baseUrl}/</loc>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
    ${urls.join('\n')}
  </urlset>`;

  fs.writeFileSync(path.resolve('public/sitemap.xml'), sitemap.trim());
  console.log(`✅ Sitemap generated with ${chatRoutes.length} chat routes.`);
}

generateSitemap();
