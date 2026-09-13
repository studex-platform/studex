/**
 * StudeX shared content layer — نسخة Firestore محسنة جداً مع LocalStorage Fallback فوري (0 ثانية انتظار).
 */
(function (global) {
  const SECTIONS = {
    career: {
      label: 'التطوير المهني',
      entryMode: 'article',
      subTabs: {
        linkedin: {
          label: 'دليل LinkedIn',
          cards: [
            { key: 'linkedin_intro', label: 'التعريف بـ LinkedIn' },
            { key: 'linkedin_signup', label: 'طريقة إنشاء حساب' },
            { key: 'linkedin_networking', label: 'استراتيجيات بناء الشبكة والتواصل' },
          ],
        },
        orgs: {
          label: 'المؤسسات والحسابات المهمة',
          cards: [
            { key: 'org_42amman', label: '42 Amman' },
            { key: 'org_cpf', label: 'مؤسسة ولي العهد' },
            { key: 'org_ieee', label: 'مجتمعات IEEE البرمجية والتقنية' },
          ],
        },
      },
    },
    opportunities: {
      label: 'الفرص والدورات',
      entryMode: 'link-list',
      subTabs: {
        courses: {
          label: 'الدورات',
          cards: [
            { key: 'tech_courses', label: 'دورات تقنية وبرمجة' },
          ],
        },
        opportunities: {
          label: 'الفرص',
          cards: [
            { key: 'scholarships', label: 'منح دراسية' },
            { key: 'internships', label: 'فرص تدريب' },
            { key: 'student_teams_list', label: 'فرق طلابية' },
            { key: 'conferences', label: 'مؤتمرات' },
            { key: 'workshops', label: 'ورشات عمل' },
          ],
        },
      },
    },
    academic: {
      label: 'المصادر الأكاديمية',
      entryMode: 'flexible',
      subTabs: {
        general: {
          label: 'عام',
          cards: [
            { key: 'slides', label: 'مصادر المواد والسلايدات وأسئلة السنوات' },
            { key: 'doctors', label: 'إيميلات الدكاترة' },
          ],
        },
        ai_tools: {
          label: 'أدوات AI',
          cards: [
            { key: 'ai_tools', label: 'أدوات AI' },
          ],
        },
      },
    },
  };

  const COLLECTION_NAME = 'studex_items';
  const STORAGE_PREFIX = 'studex_cache_';

  // خريطة دمج البطاقات القديمة: أي مفتاح بطاقة تم إلغاؤه بعد دمج الكاردات
  // يُعاد توجيهه تلقائياً (ولمرة واحدة لكل عنصر) إلى مفتاح البطاقة الجديدة المدمجة،
  // حتى لا تُفقد أو "تُعلَّق" أي عناصر كانت منشورة سابقاً تحت المفتاح القديم.
  const LEGACY_CARD_MERGES = {
    past_papers: 'slides',
  };
  
  // تحميل فوري من الـ localStorage للذاكرة المؤقتة لمنع أي تأخير
  const memoryCache = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const cardKey = key.replace(STORAGE_PREFIX, '');
        memoryCache[cardKey] = JSON.parse(localStorage.getItem(key)) || [];
      }
    }
  } catch (e) {}

  function getDb() {
    const db = global.studexDb;
    if (!db) {
      throw new Error('Firestore غير مهيأ');
    }
    return db;
  }

  function normalizeItem(item) {
    const normalized = { ...item };
    Object.keys(normalized).forEach((k) => {
      if (normalized[k] === undefined) delete normalized[k];
    });
    if ('link' in normalized || normalized.kind === 'link' || normalized.kind === 'drive') {
      normalized.link = (normalized.link || '').trim();
    }
    return normalized;
  }

  function sortByCreatedAt(list) {
    return list.slice().sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }

  function saveToLocal(cardKey, data) {
    memoryCache[cardKey] = data;
    try {
      localStorage.setItem(STORAGE_PREFIX + cardKey, JSON.stringify(data));
    } catch (e) {}
  }

  async function getItems(cardKey) {
    // إذا كانت البيانات موجودة محلياً، ارجعها فوراً بنسبة 0 تأخير
    if (memoryCache[cardKey] && memoryCache[cardKey].length > 0) {
      // جلب التحديث من الخلفية بصمت
      fetchBackground(cardKey);
      return memoryCache[cardKey];
    }

    try {
      const db = getDb();
      const snap = await db.collection(COLLECTION_NAME).where('cardKey', '==', cardKey).get();
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sorted = sortByCreatedAt(items);
      saveToLocal(cardKey, sorted);
      return sorted;
    } catch (e) {
      return memoryCache[cardKey] || [];
    }
  }

  async function fetchBackground(cardKey) {
    try {
      const db = getDb();
      const snap = await db.collection(COLLECTION_NAME).where('cardKey', '==', cardKey).get();
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sorted = sortByCreatedAt(items);
      saveToLocal(cardKey, sorted);
    } catch (e) {}
  }

  // جلب دفعي (batch) لعدة مفاتيح بطاقات دفعة واحدة عبر استعلام Firestore
  // واحد فقط (where cardKey 'in' [...]) بدل استعلام منفصل لكل مفتاح.
  // يفيد الصفحات التي تحتوي عدداً كبيراً من البطاقات (مثل opportunities.html
  // بستة مفاتيح) بحيث تنخفض عدد رحلات الشبكة من N إلى رحلة واحدة، بدلاً من
  // مضاعفة عدد الاستعلامات المتزامنة عند كل تحميل صفحة.
  // يرجع كائن { cardKey: items[] } يغطي كل المفاتيح المطلوبة.
  async function getItemsBatch(cardKeys) {
    const result = {};
    const missing = [];

    cardKeys.forEach((key) => {
      if (memoryCache[key] && memoryCache[key].length > 0) {
        result[key] = memoryCache[key];
        // تحديث هادئ بالخلفية، بنفس فلسفة getItems()
        fetchBackground(key);
      } else {
        missing.push(key);
      }
    });

    if (!missing.length) return result;

    try {
      const db = getDb();
      // حد Firestore لعامل 'in' هو 30 قيمة، وهذا يكفي بمراحل لأي عدد
      // بطاقات حالي أو متوقع بالموقع.
      const snap = await db.collection(COLLECTION_NAME).where('cardKey', 'in', missing).get();
      const grouped = {};
      missing.forEach((key) => { grouped[key] = []; });
      snap.docs.forEach((d) => {
        const data = d.data();
        const key = data.cardKey;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({ id: d.id, ...data });
      });
      missing.forEach((key) => {
        const sorted = sortByCreatedAt(grouped[key] || []);
        saveToLocal(key, sorted);
        result[key] = sorted;
      });
    } catch (e) {
      missing.forEach((key) => { result[key] = memoryCache[key] || []; });
    }

    return result;
  }

  async function getItem(cardKey, id) {
    if (memoryCache[cardKey]) {
      const found = memoryCache[cardKey].find(item => item.id === id);
      if (found) return found;
    }
    try {
      const docSnap = await getDb().collection(COLLECTION_NAME).doc(id).get();
      if (!docSnap.exists) return null;
      const data = docSnap.data();
      if (data.cardKey !== cardKey) return null;
      return { id: docSnap.id, ...data };
    } catch (e) {
      return null;
    }
  }

  async function addItem(cardKey, item) {
    const record = normalizeItem({ ...item, cardKey, createdAt: Date.now() });
    const ref = await getDb().collection(COLLECTION_NAME).add(record);
    const newObj = { id: ref.id, ...record };
    const current = memoryCache[cardKey] || [];
    saveToLocal(cardKey, [...current, newObj]);
    return newObj;
  }

  async function updateItem(cardKey, id, patch) {
    const normalizedPatch = normalizeItem({ ...patch, updatedAt: Date.now() });
    await getDb().collection(COLLECTION_NAME).doc(id).update(normalizedPatch);
    const current = memoryCache[cardKey] || [];
    const updatedList = current.map(i => i.id === id ? { ...i, ...normalizedPatch } : i);
    saveToLocal(cardKey, updatedList);
    return getItem(cardKey, id);
  }

  async function deleteItem(cardKey, id) {
    await getDb().collection(COLLECTION_NAME).doc(id).delete();
    const current = memoryCache[cardKey] || [];
    saveToLocal(cardKey, current.filter(i => i.id !== id));
  }

  async function moveItem(fromCardKey, toCardKey, id, patch) {
    const normalizedPatch = normalizeItem({ ...patch, cardKey: toCardKey, updatedAt: Date.now() });
    await getDb().collection(COLLECTION_NAME).doc(id).update(normalizedPatch);
    
    const fromList = memoryCache[fromCardKey] || [];
    saveToLocal(fromCardKey, fromList.filter(i => i.id !== id));
    
    const updated = await getItem(toCardKey, id);
    if (updated) {
      const toList = memoryCache[toCardKey] || [];
      saveToLocal(toCardKey, [...toList, updated]);
    }
    return updated;
  }

  async function loadAll() {
    try {
      const snap = await getDb().collection(COLLECTION_NAME).get();
      const all = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        const key = data.cardKey;
        if (!key) return;
        if (!all[key]) all[key] = [];
        all[key].push({ id: d.id, ...data });
      });
      Object.keys(all).forEach((k) => { 
        all[k] = sortByCreatedAt(all[k]);
        saveToLocal(k, all[k]);
      });
      return all;
    } catch (e) {
      return {};
    }
  }

  function findCardMeta(cardKey) {
    for (const secKey of Object.keys(SECTIONS)) {
      const section = SECTIONS[secKey];
      for (const subKey of Object.keys(section.subTabs)) {
        const sub = section.subTabs[subKey];
        const card = sub.cards.find((c) => c.key === cardKey);
        if (card) {
          return {
            sectionKey: secKey,
            sectionLabel: section.label,
            entryMode: section.entryMode,
            subTabKey: subKey,
            subTabLabel: sub.label,
            cardKey: card.key,
            cardLabel: card.label,
          };
        }
      }
    }
    return null;
  }

  function allCardKeys() {
    const keys = [];
    Object.values(SECTIONS).forEach((section) => {
      Object.values(section.subTabs).forEach((sub) => {
        sub.cards.forEach((c) => keys.push(c.key));
      });
    });
    return keys;
  }

  async function migrateLegacyCardKeys() {
    const fromKeys = Object.keys(LEGACY_CARD_MERGES);
    if (!fromKeys.length) return;

    for (const fromKey of fromKeys) {
      const toKey = LEGACY_CARD_MERGES[fromKey];
      try {
        const db = getDb();
        const snap = await db.collection(COLLECTION_NAME).where('cardKey', '==', fromKey).get();
        if (snap.empty) continue;

        const batch = db.batch();
        snap.docs.forEach((d) => {
          batch.update(d.ref, { cardKey: toKey, updatedAt: Date.now() });
        });
        await batch.commit();

        // نظّف الكاش المحلي القديم حتى لا تبقى نسخة "يتيمة" منه
        try { localStorage.removeItem(STORAGE_PREFIX + fromKey); } catch (e) {}
        delete memoryCache[fromKey];

        // أعد جلب البطاقة الجديدة فوراً لتشمل العناصر المنقولة حديثاً
        await fetchBackground(toKey);
      } catch (e) {
        console.error('[StudeX] فشل ترحيل عناصر البطاقة القديمة "' + fromKey + '" إلى "' + toKey + '":', e);
      }
    }
  }

  async function seedIfEmpty(seedData) {
    const keys = Object.keys(seedData);
    await Promise.all(keys.map(async (cardKey) => {
      const existing = await getItems(cardKey);
      if (existing.length) return;
      const batch = getDb().batch();
      seedData[cardKey].forEach((it) => {
        const ref = getDb().collection(COLLECTION_NAME).doc();
        batch.set(ref, normalizeItem({ cardKey, createdAt: Date.now(), ...it }));
      });
      await batch.commit();
      fetchBackground(cardKey);
    }));
  }

  global.StudexStore = {
    SECTIONS,
    normalizeItem,
    getItems,
    getItemsBatch,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    moveItem,
    loadAll,
    findCardMeta,
    allCardKeys,
    seedIfEmpty,
    ready: migrateLegacyCardKeys().catch(() => {})
  };

  /* =====================================================================
     منشورات مجتمع الطلاب (StudeX Community)
     تُخزَّن الآن في Firestore بدلاً من localStorage، كي تكون البيانات حية
     ومشتركة بين جميع الأجهزة: منشور طالب من جهازه يظهر فوراً لكل الطلاب
     الآخرين، ويظهر أيضاً بشكل صحيح في لوحة تحكم الأدمن بغض النظر عن الجهاز
     الذي فُتحت منه — بعكس localStorage الذي يبقى محصوراً بمتصفح واحد فقط.
  ===================================================================== */
  const COMMUNITY_COLLECTION = 'studex_community_posts';
  const COMMUNITY_CACHE_KEY = 'studex_community_cache_v1';

  // كاش محلي فوري (0 ثانية انتظار) لعرض آخر نسخة معروفة من المنشورات فور
  // فتح الصفحة، بينما يتم الاتصال بالمزامنة الحية عبر Firestore بالخلفية.
  let communityCache = [];
  try {
    const raw = localStorage.getItem(COMMUNITY_CACHE_KEY);
    communityCache = raw ? JSON.parse(raw) : [];
  } catch (e) { communityCache = []; }

  function saveCommunityCache(posts) {
    communityCache = posts;
    try { localStorage.setItem(COMMUNITY_CACHE_KEY, JSON.stringify(posts)); } catch (e) {}
  }

  function getCachedCommunityPosts() {
    return communityCache;
  }

  async function fetchCommunityPosts() {
    try {
      const db = getDb();
      const snap = await db.collection(COMMUNITY_COLLECTION).get();
      const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      saveCommunityCache(posts);
      return posts;
    } catch (e) {
      console.error('[StudexCommunity] فشل تحميل منشورات المجتمع', e);
      return communityCache;
    }
  }

  // يفتح استماعاً حياً (onSnapshot) على كل منشورات المجتمع؛ يستدعي callback
  // فوراً بأي تغيير (منشور جديد، موافقة، رفض، حذف تعليق...) وارد من أي جهاز،
  // بما فيها التغييرات المحلية المُعلَّقة (pending writes) لإحساس فوري بلا تأخير.
  // يرجع دالة لإلغاء الاشتراك عند مغادرة الصفحة.
  function subscribeCommunityPosts(callback) {
    try {
      const db = getDb();
      return db.collection(COMMUNITY_COLLECTION).onSnapshot((snap) => {
        const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        saveCommunityCache(posts);
        callback(posts);
      }, (err) => {
        console.error('[StudexCommunity] خطأ في المزامنة الحية لمنشورات المجتمع', err);
      });
    } catch (e) {
      console.error('[StudexCommunity] تعذر بدء المزامنة الحية', e);
      return () => {};
    }
  }

  async function addCommunityPost(post) {
    const db = getDb();
    const id = post.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
    const record = normalizeItem({ ...post });
    delete record.id;
    await db.collection(COMMUNITY_COLLECTION).doc(id).set(record);
    const newPost = { id, ...record };
    saveCommunityCache([newPost, ...communityCache.filter((p) => p.id !== id)]);
    return newPost;
  }

  // تحديث جزئي (merge) لحقول منشور موجود — يُستخدم للموافقة/الرفض، أو
  // لحفظ شجرة الردود كاملة بعد إضافة/حذف تعليق، دون المساس ببقية الحقول.
  async function updateCommunityPost(id, patch) {
    const db = getDb();
    const normalizedPatch = normalizeItem({ ...patch });
    await db.collection(COMMUNITY_COLLECTION).doc(id).update(normalizedPatch);
    const updated = communityCache.map((p) => (p.id === id ? { ...p, ...normalizedPatch } : p));
    saveCommunityCache(updated);
    return updated.find((p) => p.id === id) || null;
  }

  async function deleteCommunityPost(id) {
    const db = getDb();
    await db.collection(COMMUNITY_COLLECTION).doc(id).delete();
    saveCommunityCache(communityCache.filter((p) => p.id !== id));
  }

  // زيادة/إنقاص عدّاد الإعجابات بشكل ذرّي (atomic) عبر الخادم لتفادي تضارب
  // التحديثات المتزامنة من عدة طلاب في نفس اللحظة.
  async function incrementCommunityLikes(id, delta) {
    const db = getDb();
    const inc = global.firebase.firestore.FieldValue.increment(delta);
    await db.collection(COMMUNITY_COLLECTION).doc(id).update({ likes: inc });
    const updated = communityCache.map((p) => (p.id === id ? { ...p, likes: Math.max(0, (p.likes || 0) + delta) } : p));
    saveCommunityCache(updated);
  }

  // يزرع بيانات تجريبية أولية مرة واحدة فقط إن كانت المجموعة فارغة بالكامل
  // على Firestore (وليس فقط فارغة محلياً)، لتفادي تكرار الزرع من كل جهاز.
  async function seedCommunityIfEmpty(seedList) {
    try {
      const db = getDb();
      const snap = await db.collection(COMMUNITY_COLLECTION).limit(1).get();
      if (!snap.empty) return;
      const batch = db.batch();
      seedList.forEach((p) => {
        const record = normalizeItem({ ...p });
        const id = record.id;
        delete record.id;
        const ref = db.collection(COMMUNITY_COLLECTION).doc(id);
        batch.set(ref, record);
      });
      await batch.commit();
      await fetchCommunityPosts();
    } catch (e) {
      console.error('[StudexCommunity] فشل زرع بيانات المجتمع الأولية', e);
    }
  }

  global.StudexCommunity = {
    getCachedPosts: getCachedCommunityPosts,
    fetchPosts: fetchCommunityPosts,
    subscribe: subscribeCommunityPosts,
    addPost: addCommunityPost,
    updatePost: updateCommunityPost,
    deletePost: deleteCommunityPost,
    incrementLikes: incrementCommunityLikes,
    seedIfEmpty: seedCommunityIfEmpty,
  };

  // مزامنة شاملة هادئة بالخلفية عند فتح الصفحة لتحديث الكاش المحلي بأحدث بيانات الـ Firestore
  setTimeout(() => {
    try {
      getDb().collection(COLLECTION_NAME).get().then(snap => {
        const all = {};
        snap.docs.forEach(d => {
          const data = d.data();
          const key = data.key || data.cardKey;
          if (!key) return;
          if (!all[key]) all[key] = [];
          all[key].push({ id: d.id, ...data });
        });
        Object.keys(all).forEach(k => {
          saveToLocal(k, sortByCreatedAt(all[k]));
        });
      }).catch(() => {});
    } catch(e) {}
  }, 500);

})(window);