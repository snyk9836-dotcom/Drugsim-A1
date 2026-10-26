/* install.js — زر تثبيت مخصص + إصلاح التثبيت العالق */
(function(){
  var standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  var deferred = null, btn = null;

  // افتح الموقع بهذا الرابط:  ...?reset=1  لمسح الكاش والـ service worker القديمين
  function hardReset(){
    var tasks = [];
    if (navigator.serviceWorker) tasks.push(navigator.serviceWorker.getRegistrations().then(function(rs){return Promise.all(rs.map(function(r){return r.unregister()}))}));
    if (window.caches) tasks.push(caches.keys().then(function(ks){return Promise.all(ks.map(function(k){return caches.delete(k)}))}));
    try{ localStorage.removeItem("installDismissed") }catch(e){}
    return Promise.all(tasks);
  }
  if (/[?&]reset=1/.test(location.search)) {
    hardReset().then(function(){ location.replace(location.pathname); });
    return;
  }

  function makeBtn(){
    if (btn || standalone) return;
    btn = document.createElement("button");
    btn.textContent = "📲 تثبيت التطبيق";
    btn.style.cssText = "position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:99999;padding:12px 22px;border:0;border-radius:30px;background:#d9a441;color:#0a0b0f;font:700 15px Tahoma,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.5);cursor:pointer";
    btn.onclick = function(){
      if (!deferred) { alert("من قائمة المتصفح ⋮ اختر: تثبيت التطبيق / إضافة إلى الشاشة الرئيسية"); return; }
      deferred.prompt();
      deferred.userChoice.then(function(c){ deferred = null; if (c.outcome === "accepted") btn.remove(); });
    };
    document.body.appendChild(btn);
  }

  addEventListener("beforeinstallprompt", function(e){
    e.preventDefault(); deferred = e;
    if (document.body) makeBtn(); else addEventListener("DOMContentLoaded", makeBtn);
  });

  // إذا اشتغل كتطبيق، أو تم التثبيت، اخفِ الزر
  addEventListener("appinstalled", function(){ deferred = null; if (btn) btn.remove(); });
})();
