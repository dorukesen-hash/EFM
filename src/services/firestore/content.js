// src/services/firestore/content.js
// Blog ve makale içerikleri için sunucu tarafı (Admin SDK) veri erişim fonksiyonları.
// Sadece server component / API route içinde kullanılır — client component'lere import etme.
import admin from '../firebase/firebaseAdmin';

const DEFAULT_PAGE_SIZE = 9;

// Bir sayfayı doldurmak için Firestore'dan kaç kez ham (ham = status filtresinden önce)
// doküman batch'i çekmeye çalışılacağını sınırlar. Art arda çok sayıda draft/scheduled
// doküman varsa sayfa limit'in altında dönebilir, ama en azından sonsuz döngüye girmeyiz
// ve mümkün olduğunca sayfayı doldururuz.
const MAX_FETCH_ATTEMPTS = 10;

function safeDecode(slug) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

// Task 1 brief'i status alanını dikkate almadan yazılmıştı; ama repo'da draft/scheduled/
// published görünürlük mantığı (isPubliclyVisible) src/app/api/articles/route.js ve
// src/app/api/blogs/route.js içinde zaten var ve review'dan geçti. Aynı mantığı burada da
// uyguluyoruz ki bu yeni data layer üzerinden draft/henüz-zamanı-gelmemiş-scheduled
// dokümanlar (liste VEYA slug ile tekil okuma dahil) sızmasın.
function isPubliclyVisible(doc) {
  if (doc.status === undefined) return true; // eski, status alanı olmayan içerikler
  if (doc.status === 'published') return true;
  if (doc.status === 'scheduled' && doc.scheduledAt) {
    return new Date(doc.scheduledAt).getTime() <= Date.now();
  }
  return false; // draft, veya zamanı henüz gelmemiş scheduled
}

// Verilen collection'dan, tarihe göre (yeniden eskiye) sıralı, sadece publicly-visible
// dokümanlardan oluşan bir "sayfa" döner. Firestore'un .limit(n)'i ham dokümanlar üzerinde
// çalıştığı için (status filtresinden önce), tek bir .limit(n) sorgusu draft/scheduled
// dokümanlar yüzünden n'den az görünür sonuç döndürebilir. Bunu önlemek için: ham
// dokümanları limit boyutunda batch'ler halinde okuyup, uygulama tarafında filtreleyip
// biriktiriyoruz; limit'e ulaşana, ham dokümanlar tükenene ya da deneme sınırına
// (MAX_FETCH_ATTEMPTS) ulaşana kadar devam ediyoruz. nextCursor, sayfaya dahil edilen
// SON görünür dokümanın işlendiği ham dokümanın `date` alanı olarak set edilir — böylece
// bir batch içinde limit'i doldurduktan sonra kalan (henüz döndürülmemiş) görünür
// dokümanlar bir sonraki sayfa isteğinde tekrar taranır ve kaybolmaz.
async function fetchVisiblePage(db, collectionName, { limit, cursor }) {
  const visible = [];
  let currentCursor = cursor || null;
  let exhausted = false; // ham dokümanların tükendiğini kesin olarak biliyorsak true
  let attempts = 0;

  while (visible.length < limit && attempts < MAX_FETCH_ATTEMPTS && !exhausted) {
    attempts += 1;
    let query = db.collection(collectionName).orderBy('date', 'desc').limit(limit);
    if (currentCursor) query = query.startAfter(currentCursor);

    const snapshot = await query.get();
    if (snapshot.empty) {
      exhausted = true;
      break;
    }

    const rawDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    let filledInThisBatch = false;
    for (const item of rawDocs) {
      currentCursor = item.date ?? currentCursor;
      if (isPubliclyVisible(item)) {
        visible.push(item);
        if (visible.length === limit) {
          filledInThisBatch = true;
          break;
        }
      }
    }

    if (filledInThisBatch) break;
    if (rawDocs.length < limit) {
      // Firestore istenen limit'ten az ham doküman döndürdüyse, koleksiyonda başka
      // doküman kalmamış demektir.
      exhausted = true;
      break;
    }
    // Aksi halde döngü devam eder; currentCursor bu batch'teki son ham dokümanın
    // tarihine güncellendi.
  }

  const nextCursor = exhausted ? null : currentCursor;
  return { items: visible.slice(0, limit), nextCursor };
}

export async function getArticlesPage({ limit = DEFAULT_PAGE_SIZE, cursor = null } = {}) {
  const db = admin.firestore();
  const { items, nextCursor } = await fetchVisiblePage(db, 'articles', { limit, cursor });
  return { articles: items, nextCursor };
}

export async function getAllArticles() {
  const db = admin.firestore();
  const snapshot = await db.collection('articles').orderBy('date', 'desc').get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(isPubliclyVisible);
}

export async function getArticleBySlug(slug) {
  if (!slug) return null;
  const db = admin.firestore();
  const doc = await db.collection('articles').doc(safeDecode(slug)).get();
  if (!doc.exists) return null;
  const data = { id: doc.id, ...doc.data() };
  return isPubliclyVisible(data) ? data : null;
}

export async function getBlogsPage({ limit = DEFAULT_PAGE_SIZE, cursor = null } = {}) {
  const db = admin.firestore();
  const { items, nextCursor } = await fetchVisiblePage(db, 'blogs', { limit, cursor });
  return { blogs: items, nextCursor };
}

export async function getAllBlogs() {
  const db = admin.firestore();
  const snapshot = await db.collection('blogs').orderBy('date', 'desc').get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(isPubliclyVisible);
}

export async function getBlogBySlug(slug) {
  if (!slug) return null;
  const db = admin.firestore();
  const doc = await db.collection('blogs').doc(safeDecode(slug)).get();
  if (!doc.exists) return null;
  const data = { id: doc.id, ...doc.data() };
  return isPubliclyVisible(data) ? data : null;
}
