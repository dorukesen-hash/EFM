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

// Sayfalama cursor'ı sadece `date` alanından oluşursa, aynı `date` değerine sahip
// (örn. aynı gün yayınlanmış) birden fazla doküman varsa Firestore'un
// startAfter(date) çağrısı o tarihe sahip TÜM dokümanları atlar — sadece cursor'ın
// geldiği dokümanı değil. `date` <input type="date"> gibi gün hassasiyetinde
// (YYYY-MM-DD) girildiği için aynı güne denk gelen iki içerik pratikte olasıdır.
// Bunu önlemek için cursor, (date, documentId) ikilisinden oluşan bileşik bir
// değerdir — tek başına `date` asla eşsiz bir sıralama anahtarı olmadığından,
// documentId ikinci sıralama alanı olarak eklenir (Firestore bunun için ekstra bir
// composite index istemez, orderBy(field).orderBy(documentId()) standart bir
// pattern'dir). Dışa aktarılan (API'ye dönen) cursor string formatı: `"${date}|${id}"`
// — `date` sabit YYYY-MM-DD formatında olduğu ve `|` karakteri içermediği için, bu
// string ilk `|` karakterinden ikiye bölünerek güvenle decode edilebilir (id kısmı
// teorik olarak `|` içerse bile sorun olmaz, çünkü sadece date tarafı format olarak
// sabit tutulur ve ilk ayraçtan bölünür).
function encodeCursor(item) {
  return `${item.date}|${item.id}`;
}

function decodeCursor(cursor) {
  if (!cursor) return null;
  const sep = cursor.indexOf('|');
  if (sep === -1) return null; // eski/bozuk (yalnızca-date) cursor — baştan başla
  return { date: cursor.slice(0, sep), id: cursor.slice(sep + 1) };
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

// Verilen collection'dan, tarihe göre (yeniden eskiye, eşit tarihlerde documentId'ye
// göre) sıralı, sadece publicly-visible dokümanlardan oluşan bir "sayfa" döner.
// Firestore'un .limit(n)'i ham dokümanlar üzerinde çalıştığı için (status
// filtresinden önce), tek bir .limit(n) sorgusu draft/scheduled dokümanlar yüzünden
// n'den az görünür sonuç döndürebilir. Bunu önlemek için: ham dokümanları limit
// boyutunda batch'ler halinde okuyup, uygulama tarafında filtreleyip biriktiriyoruz;
// limit'e ulaşana, ham dokümanlar tükenene ya da deneme sınırına
// (MAX_FETCH_ATTEMPTS) ulaşana kadar devam ediyoruz. `cursorParts`, sayfaya dahil
// edilen SON görünür dokümanın işlendiği ham dokümanın (date, id) ikilisi olarak
// güncellenir — böylece bir batch içinde limit'i doldurduktan sonra kalan (henüz
// döndürülmemiş) görünür dokümanlar bir sonraki sayfa isteğinde tekrar taranır ve
// kaybolmaz. (date, id) ikilisi kullanılması, aynı `date` değerine sahip birden
// fazla dokümanın sayfa sınırında sessizce atlanmasını (bkz. decodeCursor üstündeki
// yorum) önler.
async function fetchVisiblePage(db, collectionName, { limit, cursor }) {
  const visible = [];
  let cursorParts = decodeCursor(cursor); // { date, id } | null
  let exhausted = false; // ham dokümanların tükendiğini kesin olarak biliyorsak true
  let attempts = 0;

  while (visible.length < limit && attempts < MAX_FETCH_ATTEMPTS && !exhausted) {
    attempts += 1;
    let query = db
      .collection(collectionName)
      .orderBy('date', 'desc')
      .orderBy(admin.firestore.FieldPath.documentId(), 'desc')
      .limit(limit);
    if (cursorParts) query = query.startAfter(cursorParts.date, cursorParts.id);

    const snapshot = await query.get();
    if (snapshot.empty) {
      exhausted = true;
      break;
    }

    const rawDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    let filledInThisBatch = false;
    for (const item of rawDocs) {
      cursorParts = { date: item.date, id: item.id };
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
    // Aksi halde döngü devam eder; cursorParts bu batch'teki son ham dokümanın
    // (date, id) ikilisine güncellendi.
  }

  const nextCursor = exhausted || !cursorParts ? null : encodeCursor(cursorParts);
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

// Task 8 brief'i sadece `.where('category','==',...).orderBy('date','desc').limit(count+1)`
// öneriyordu — status filtresi yoktu. Bu, "İlgili Yazılar/Makaleler" widget'ında draft veya
// henüz zamanı gelmemiş scheduled içeriklerin herkese açık sayfalarda sızmasına yol açardı;
// Task 1'in ana liste/lookup fonksiyonlarında düzelttiği ile aynı sınıf regresyon. Burada da
// isPubliclyVisible uygulanıyor.
//
// `.where('category','==',...).orderBy('date','desc')` birlikte kullanıldığında Firestore
// composite index istiyor (brief bunu not etmişti); bu ortamda index oluşturma yetkisi
// (Firestore Index Admin) service account'ta tanımlı değil, dolayısıyla index'i buradan
// programatik olarak oluşturamadık ve Firebase Console'a interaktif erişimimiz yok. Bunun
// yerine sorguyu index gerektirmeyecek şekilde yeniden kurduk: sadece `.where('category','==',...)`
// (tekil-alan eşitlik sorgusu, Firestore'un otomatik oluşturduğu index yeterli), orderBy YOK.
// Sıralama (tarihe göre yeniden eskiye) ve count'a kırpma, görünürlük filtresinden SONRA JS
// tarafında yapılıyor. "İlgili yazılar" küçük ölçekli bir özellik olduğundan (bir kategoride
// binlerce yazı beklenmiyor), tüm kategori eşleşenlerini çekip bellekte sıralamak güvenli ve
// index gerektirmiyor — ana sayfalama (Task 1) için bu yaklaşım uygun olmazdı ama burada uygun.
async function fetchRelated(collectionName, category, excludeSlug, count) {
  if (!category) return [];
  const db = admin.firestore();
  const snapshot = await db.collection(collectionName)
    .where('category', '==', category)
    .get();
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(isPubliclyVisible)
    .filter(item => item.slug !== excludeSlug)
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db_ = b.date ? new Date(b.date).getTime() : 0;
      return db_ - da;
    })
    .slice(0, count);
}

export async function getRelatedBlogs(category, excludeSlug, count = 3) {
  return fetchRelated('blogs', category, excludeSlug, count);
}

export async function getRelatedArticles(category, excludeSlug, count = 3) {
  return fetchRelated('articles', category, excludeSlug, count);
}
