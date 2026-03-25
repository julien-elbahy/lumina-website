/* Lumina SEO — Shared JS */
(function(){
  // Theme toggle
  var _t=localStorage.getItem('lumina_theme')||'dark';
  document.documentElement.setAttribute('data-theme',_t);
  var _tb=document.getElementById('themeToggle');
  if(_tb){
    _tb.textContent=_t==='dark'?'\u2600\ufe0f':'\ud83c\udf19';
    _tb.addEventListener('click',function(){
      _t=_t==='dark'?'light':'dark';
      document.documentElement.setAttribute('data-theme',_t);
      _tb.textContent=_t==='dark'?'\u2600\ufe0f':'\ud83c\udf19';
      localStorage.setItem('lumina_theme',_t);
    });
  }
  // Burger menu
  var _bb=document.getElementById('burgerBtn'),_mm=document.getElementById('mobileMenu');
  if(_bb&&_mm){
    _bb.addEventListener('click',function(){
      _bb.classList.toggle('open');
      _mm.classList.toggle('open');
      document.body.style.overflow=_mm.classList.contains('open')?'hidden':'';
    });
  }
  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var i=q.parentElement,w=i.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function(x){x.classList.remove('open')});
      if(!w)i.classList.add('open');
    });
  });
})();
