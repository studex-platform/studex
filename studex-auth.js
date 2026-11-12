/**
 * StudeX — تسجيل دخول الأدمن عبر Firebase Authentication.
 *
 * يُحمَّل بعد firebase-app-compat.js و firebase-auth-compat.js و firebase-config.js.
 * يُستخدم في admin.html و community.html.
 *
 * ⚠️ قائمة إيميلات الأدمن هنا يجب أن تطابق القائمة الموجودة في Firestore Rules
 *    (الدالة isAdmin). إضافة إيميل هنا فقط لا تعطيه صلاحية الكتابة.
 */
(function (global) {
  'use strict';

  var ADMIN_EMAILS = ['myazan914@gmail.com'];

  var auth = (global.firebase && global.firebase.auth) ? global.firebase.auth() : null;
  var current = null;
  var ready = false;
  var listeners = [];

  function isAdminUser(user) {
    return !!(user && user.email && ADMIN_EMAILS.indexOf(String(user.email).toLowerCase()) !== -1);
  }

  if (auth) {
    auth.onAuthStateChanged(function (user) {
      current = user;
      ready = true;
      listeners.forEach(function (fn) {
        try { fn(user, isAdminUser(user)); } catch (e) { console.error('[StudexAuth]', e); }
      });
    });
  } else {
    console.error('[StudexAuth] firebase-auth-compat.js غير محمّل.');
  }

  function need() {
    if (!auth) return Promise.reject(new Error('Firebase Auth غير محمّل'));
    return null;
  }

  global.StudexAuth = {
    ADMIN_EMAILS: ADMIN_EMAILS,
    isAdmin: function () { return isAdminUser(current); },
    user: function () { return current; },
    /* يُستدعى فوراً إذا كانت الحالة معروفة، ثم مع كل تسجيل دخول/خروج */
    onChange: function (fn) {
      listeners.push(fn);
      if (ready) { try { fn(current, isAdminUser(current)); } catch (e) { console.error('[StudexAuth]', e); } }
    },
    signIn: function (email, password) { return need() || auth.signInWithEmailAndPassword(email, password); },
    signOut: function () { return need() || auth.signOut(); },
    resetPassword: function (email) { return need() || auth.sendPasswordResetEmail(email); }
  };
})(window);
