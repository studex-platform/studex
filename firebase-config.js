/**
 * إعداد Firebase لمنصة StudeX — نسخة compat (تعمل بسكربتات <script> عادية
 * بدون الحاجة لـ type="module"، لتفادي أي مشاكل مع أدوات النشر التي تحوّل
 * ملفات HTML إلى رابط + QR code وقد لا تتعامل بشكل موثوق مع ES Modules).
 *
 * يجب تحميل هذين السكربتين في <head> أو قبل هذا الملف مباشرة:
 *   <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
 *   <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
 */

const firebaseConfig = {
  apiKey: "AIzaSyDG4RTgK6BOVgQzlLAl7mZwou3vOJJHw1A",
  authDomain: "studex-24be4.firebaseapp.com",
  projectId: "studex-24be4",
  storageBucket: "studex-24be4.firebasestorage.app",
  messagingSenderId: "665388757615",
  appId: "1:665388757615:web:8eb16e57556d7fbef6939a",
  measurementId: "G-0S1WN73DZE"
};

firebase.initializeApp(firebaseConfig);

// studex-store.js يقرأ من window.studexDb — هذا هو الرابط الوحيد بين
// الملفين، لذلك يجب تحميل firebase-config.js قبل studex-store.js دائماً.
window.studexDb = firebase.firestore();

// تفعيل التخزين المؤقت المحلي (IndexedDB) — هذا هو ما يجعل فتح الموقع
// سريعاً تقريباً مثل localStorage بعد أول زيارة: بمجرد ما يُخزَّن أي محتوى
// بالكاش المحلي لهذا المتصفح، يقرأ studex-store.js منه مباشرة (فوري) بدل
// انتظار الشبكة في كل مرة. لا يؤثر على تلقي البيانات الجديدة من فايربيس —
// فقط يجعل العرض الأول أسرع بكثير.
window.studexDb.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    // الوضع الطبيعي عند فتح أكثر من تبويب لنفس الموقع بنفس الوقت على
    // متصفحات لا تدعم synchronizeTabs بالكامل — لا يوقف عمل الموقع، فقط
    // يعني أن الكاش لن يُفعَّل لهذا التبويب تحديداً.
    console.warn('تعذر تفعيل التخزين المؤقت (تبويب آخر مفتوح لنفس الموقع).');
  } else if (err.code === 'unimplemented') {
    console.warn('هذا المتصفح لا يدعم التخزين المؤقت لـ Firestore — الموقع سيعمل بشكل طبيعي لكن بدون تسريع الزيارات المتكررة.');
  } else {
    console.warn('تعذر تفعيل التخزين المؤقت لـ Firestore', err);
  }
});

/**
 * نشر منشور جديد في قسم المجتمع (تُستخدم من community.html).
 * ملاحظة: هذه دالة منفصلة تماماً عن StudexStore ولا تتأثر بأي تعديل عليه.
 */
window.handleAddPost = async (e) => {
  if (e) e.preventDefault();
  const title = document.getElementById('postTitle')?.value?.trim();
  const content = document.getElementById('postContent')?.value?.trim();
  if (!title || !content) return;

  try {
    await window.studexDb.collection('posts').add({
      title,
      content,
      createdAt: Date.now(),
    });
    alert('تم النشر بنجاح!');
    location.reload();
  } catch (err) {
    console.error('فشل نشر المنشور', err);
    alert('تعذر نشر المحتوى، الرجاء المحاولة مرة أخرى.');
  }
};
