const admin = require('firebase-admin');
const path = require('path');

// Service Account Key yükle
let serviceAccount;
try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
    const decoded = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decoded);
  } else {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../serviceAccountKey.json');
    serviceAccount = require(serviceAccountPath);
  }
} catch (error) {
  console.error('❌ Service Account Key yüklenemedi:', error.message);
  console.log('Lütfen serviceAccountKey.json dosyasını proje kök dizinine ekleyin veya GOOGLE_APPLICATION_CREDENTIALS ayarlayın.');
  process.exit(1);
}

// Firebase Admin başlat
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

/**
 * Kullanıcıya admin yetkisi ver (Firestore)
 * @param {string} email - Kullanıcı email adresi
 */
async function setAdminUser(email) {
  console.log(`\n🔄 ${email} kullanıcısına admin yetkisi veriliyor...\n`);
  
  try {
    // Email'den user bul
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    
    console.log(`   UID bulundu: ${uid}`);
    console.log(`   Kullanıcı: ${userRecord.displayName || 'İsimsiz'}`);
    
    // Firestore'da isAdmin flag'ini set et
    await db.collection('users').doc(uid).set({
      isAdmin: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`\n✅ Başarılı! ${email} kullanıcısına admin yetkisi verildi!`);
    console.log(`   UID: ${uid}`);
    console.log(`   Firestore: users/${uid}/isAdmin = true`);
    console.log(`\n⚠️  Kullanıcı çıkış yapıp tekrar giriş yapmalı (yeni yetkilerin aktif olması için)\n`);
  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 İpucu: Bu email ile kayıtlı kullanıcı yok.');
      console.log('   Önce Google ile giriş yapılmalı.\n');
    }
  }
  
  process.exit();
}

/**
 * Kullanıcıdan admin yetkisini kaldır
 * @param {string} email - Kullanıcı email adresi
 */
async function removeAdminUser(email) {
  console.log(`\n🔄 ${email} kullanıcısından admin yetkisi kaldırılıyor...\n`);
  
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    
    await db.collection('users').doc(uid).set({
      isAdmin: false,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log(`\n✅ Başarılı! ${email} kullanıcısından admin yetkisi kaldırıldı.`);
    console.log(`   UID: ${uid}\n`);
  } catch (error) {
    console.error('\n❌ Hata:', error.message);
  }
  
  process.exit();
}

/**
 * Tüm admin kullanıcıları listele
 */
async function listAdmins() {
  console.log('\n📋 Admin kullanıcılar:\n');
  
  try {
    const snapshot = await db.collection('users').where('isAdmin', '==', true).get();
    
    if (snapshot.empty) {
      console.log('   Hiç admin kullanıcı yok.\n');
      process.exit();
    }
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   ✅ ${data.email || 'Email yok'}`);
      console.log(`      UID: ${doc.id}`);
      console.log(`      Ad: ${data.displayName || 'Belirtilmemiş'}`);
      console.log('');
    });
    
    console.log(`   Toplam: ${snapshot.size} admin kullanıcı\n`);
  } catch (error) {
    console.error('\n❌ Hata:', error.message);
  }
  
  process.exit();
}

// CLI kullanımı
const args = process.argv.slice(2);
const command = args[0];
const email = args[1];

if (!command) {
  console.log('\n📖 Kullanım:\n');
  console.log('   node scripts/setAdmin.js add user@example.com     # Admin yetkisi ver');
  console.log('   node scripts/setAdmin.js remove user@example.com  # Admin yetkisini kaldır');
  console.log('   node scripts/setAdmin.js list                     # Admin kullanıcıları listele');
  console.log('');
  process.exit(1);
}

switch (command) {
  case 'add':
    if (!email) {
      console.log('\n❌ Email adresi gerekli!\n');
      console.log('   Kullanım: node scripts/setAdmin.js add user@example.com\n');
      process.exit(1);
    }
    setAdminUser(email);
    break;
  
  case 'remove':
    if (!email) {
      console.log('\n❌ Email adresi gerekli!\n');
      console.log('   Kullanım: node scripts/setAdmin.js remove user@example.com\n');
      process.exit(1);
    }
    removeAdminUser(email);
    break;
  
  case 'list':
    listAdmins();
    break;
  
  default:
    console.log(`\n❌ Bilinmeyen komut: ${command}\n`);
    console.log('   Geçerli komutlar: add, remove, list\n');
    process.exit(1);
}

