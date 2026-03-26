/* Lumina Settings — Global API Key Management */
(function(){
var LS={oai:'lumina_key_openai',dfs:'lumina_key_dataforseo'};
var isDE=document.documentElement.lang==='de'||location.pathname.startsWith('/de/');
var T={
  title:isDE?'API-Einstellungen':'API Settings',
  oaiLabel:'OpenAI API Key',
  oaiHelp:isDE?'Für KI-Funktionen (Title-Generator, Schema-Generator, AI Fix). Der Key bleibt in deinem Browser.':'Used by AI features (title generator, schema generator, AI fix). Key stays in your browser.',
  oaiPlaceholder:'sk-...',
  dfsLabel:'DataForSEO API Key',
  dfsHelp:isDE?'Für Keyword Research, SERP Checker, SERP Overlap. Base64-kodiert (login:password).':'Used by Keyword Research, SERP Checker, SERP Overlap. Base64 encoded (login:password).',
  dfsPlaceholder:'Base64 encoded login:password',
  gscLabel:'Google Search Console',
  gscConnected:isDE?'Verbunden':'Connected',
  gscNot:isDE?'Nicht verbunden':'Not connected',
  gscNote:isDE?'Verbinde dich über das Keyword Research oder AI Content Optimizer Tool.':'Connect via the Keyword Research or AI Content Optimizer tool.',
  save:isDE?'Speichern':'Save',
  del:isDE?'Löschen':'Delete',
  saved:isDE?'Gespeichert':'Saved',
  notSet:isDE?'Nicht gesetzt':'Not set',
  show:isDE?'Anzeigen':'Show',
  hide:isDE?'Verbergen':'Hide',
  savedOk:isDE?'✓ Gespeichert!':'✓ Saved!',
  deletedOk:isDE?'✓ Gelöscht':'✓ Deleted',
  hintSubtle:isDE?'💡 API-Keys in ⚙️ Einstellungen hinterlegen für unbegrenzten Zugang':'💡 Save your API keys in ⚙️ Settings for unlimited access',
  hintUrgent:isDE?'Tageslimit erreicht. API-Keys in ⚙️ Einstellungen hinterlegen für unbegrenzten Zugang.':'Daily limit reached. Add your API keys in ⚙️ Settings for unlimited access.',
};
var modal=null;

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

function createModal(){
  if(modal)return;
  var overlay=document.createElement('div');
  overlay.id='luminaSettingsOverlay';
  overlay.innerHTML='<div class="ls-card">'+
    '<div class="ls-header"><h2>⚙️ '+T.title+'</h2><button class="ls-close" id="lsClose">&times;</button></div>'+
    '<div class="ls-body">'+
    keyRow('oai',T.oaiLabel,T.oaiPlaceholder,T.oaiHelp,LS.oai)+
    keyRow('dfs',T.dfsLabel,T.dfsPlaceholder,T.dfsHelp,LS.dfs)+
    '<div class="ls-section"><div class="ls-row-header"><span class="ls-label">'+T.gscLabel+'</span><span class="ls-badge" id="lsGscBadge"></span></div><p class="ls-help">'+T.gscNote+'</p></div>'+
    '</div></div>';

  var style=document.createElement('style');
  style.textContent='#luminaSettingsOverlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:10000;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .2s}#luminaSettingsOverlay.open{opacity:1}'+
  '.ls-card{background:var(--bg2);border:1px solid var(--border);border-radius:18px;max-width:480px;width:100%;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.4);max-height:90vh;overflow-y:auto}'+
  '.ls-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.ls-header h2{font-size:18px;font-weight:800;font-family:var(--font);color:var(--text);margin:0}.ls-close{background:none;border:none;font-size:24px;color:var(--muted);cursor:pointer;padding:4px 8px;line-height:1;transition:color .2s}.ls-close:hover{color:var(--text)}'+
  '.ls-section{padding:16px 0;border-top:1px solid var(--border)}.ls-section:first-child{border-top:none;padding-top:0}'+
  '.ls-row-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.ls-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--muted)}.ls-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px}.ls-badge.on{background:rgba(80,224,144,.12);color:var(--ok)}.ls-badge.off{background:var(--card);color:var(--muted)}'+
  '.ls-input-wrap{display:flex;gap:6px;margin-bottom:8px}.ls-input-wrap input{flex:1;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--text);font-family:var(--mono);font-size:12px;transition:all .2s}.ls-input-wrap input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow)}'+
  '.ls-eye{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:6px 10px;cursor:pointer;font-size:14px;line-height:1;transition:all .2s;flex-shrink:0;color:var(--muted)}.ls-eye:hover{border-color:var(--accent);color:var(--text)}'+
  '.ls-btns{display:flex;gap:6px}.ls-btn{border:none;border-radius:8px;padding:7px 14px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .2s}.ls-btn-save{background:var(--accent);color:#fff}.ls-btn-save:hover{transform:translateY(-1px);box-shadow:0 4px 16px var(--accent-glow)}.ls-btn-del{background:var(--card);color:var(--muted);border:1px solid var(--border)}.ls-btn-del:hover{color:var(--err);border-color:var(--err)}'+
  '.ls-help{font-size:11px;color:var(--muted);line-height:1.6;margin-top:6px}'+
  '.ls-status{font-size:11px;margin-top:4px;min-height:16px}'+
  '@media(max-width:500px){.ls-card{padding:16px}.ls-input-wrap{flex-wrap:wrap}}';
  document.head.appendChild(style);

  document.body.appendChild(overlay);
  requestAnimationFrame(function(){overlay.classList.add('open')});

  overlay.querySelector('#lsClose').addEventListener('click',closeModal);
  overlay.addEventListener('click',function(e){if(e.target===overlay)closeModal()});
  document.addEventListener('keydown',escHandler);

  // Wire up key rows
  wireKey('oai',LS.oai);
  wireKey('dfs',LS.dfs);

  // GSC status
  var gscToken=localStorage.getItem('lumina_gsc_token');
  var gscExpiry=parseInt(localStorage.getItem('lumina_gsc_expiry')||'0');
  var gscOk=!!gscToken&&Date.now()<gscExpiry;
  var gscBadge=overlay.querySelector('#lsGscBadge');
  gscBadge.textContent=gscOk?T.gscConnected:T.gscNot;
  gscBadge.className='ls-badge '+(gscOk?'on':'off');

  modal=overlay;
}

function keyRow(id,label,placeholder,help,lsKey){
  var saved=localStorage.getItem(lsKey);
  var badgeCls=saved?'on':'off';
  var badgeTxt=saved?T.saved:T.notSet;
  return '<div class="ls-section">'+
    '<div class="ls-row-header"><span class="ls-label">'+label+'</span><span class="ls-badge '+badgeCls+'" id="lsBadge_'+id+'">'+badgeTxt+'</span></div>'+
    '<div class="ls-input-wrap"><input type="password" id="lsInput_'+id+'" placeholder="'+placeholder+'" value="'+(saved?'••••••••••••':'')+'"><button class="ls-eye" id="lsEye_'+id+'" title="'+T.show+'">👁</button></div>'+
    '<div class="ls-btns"><button class="ls-btn ls-btn-save" id="lsSave_'+id+'">'+T.save+'</button><button class="ls-btn ls-btn-del" id="lsDel_'+id+'">'+T.del+'</button></div>'+
    '<div class="ls-status" id="lsStatus_'+id+'"></div>'+
    '<p class="ls-help">'+help+'</p></div>';
}

function wireKey(id,lsKey){
  var input=document.getElementById('lsInput_'+id);
  var eye=document.getElementById('lsEye_'+id);
  var save=document.getElementById('lsSave_'+id);
  var del=document.getElementById('lsDel_'+id);
  var badge=document.getElementById('lsBadge_'+id);
  var status=document.getElementById('lsStatus_'+id);
  var hasSaved=!!localStorage.getItem(lsKey);

  // If key exists, input shows dots but actual value is in localStorage
  input._realValue=hasSaved?localStorage.getItem(lsKey):'';
  input._isDots=hasSaved;

  input.addEventListener('focus',function(){
    if(input._isDots){input.value='';input._isDots=false;input._realValue=''}
  });
  input.addEventListener('input',function(){input._realValue=input.value;input._isDots=false});

  eye.addEventListener('click',function(){
    if(input.type==='password'){
      input.type='text';
      if(input._isDots){input.value=input._realValue}
      eye.title=T.hide;
    } else {
      input.type='password';
      eye.title=T.show;
    }
  });

  save.addEventListener('click',function(){
    var val=input._isDots?input._realValue:input.value.trim();
    if(!val)return;
    localStorage.setItem(lsKey,val);
    input._realValue=val;
    input._isDots=true;
    input.type='password';
    input.value='••••••••••••';
    badge.textContent=T.saved;badge.className='ls-badge on';
    status.textContent=T.savedOk;status.style.color='var(--ok)';
    setTimeout(function(){status.textContent=''},2000);
  });

  del.addEventListener('click',function(){
    localStorage.removeItem(lsKey);
    input.value='';input._realValue='';input._isDots=false;
    input.type='password';
    badge.textContent=T.notSet;badge.className='ls-badge off';
    status.textContent=T.deletedOk;status.style.color='var(--muted)';
    setTimeout(function(){status.textContent=''},2000);
  });
}

function escHandler(e){if(e.key==='Escape')closeModal()}

function closeModal(){
  if(!modal)return;
  modal.classList.remove('open');
  setTimeout(function(){if(modal){modal.remove();modal=null}},200);
  document.removeEventListener('keydown',escHandler);
}

// Public API
window.luminaSettings={
  open:function(){createModal()},
  close:closeModal,
  getKey:function(type){
    if(type==='openai')return localStorage.getItem(LS.oai)||'';
    if(type==='dataforseo')return localStorage.getItem(LS.dfs)||'';
    return '';
  },
  hasKey:function(type){
    if(type==='openai')return !!localStorage.getItem(LS.oai);
    if(type==='dataforseo')return !!localStorage.getItem(LS.dfs);
    return false;
  },
  // Creates a subtle or urgent hint element
  createHint:function(type,container){
    if(!container)return null;
    var keyType=type==='ai'?'openai':'dataforseo';
    if(window.luminaSettings.hasKey(keyType))return null;
    var el=document.createElement('div');
    el.className='ls-hint';el.id='lsHint_'+type;
    el.innerHTML='<span>'+T.hintSubtle+'</span>';
    el.style.cssText='font-size:11px;color:var(--muted);text-align:center;margin-top:8px;cursor:pointer;transition:all .3s';
    el.addEventListener('click',function(){window.luminaSettings.open()});
    container.appendChild(el);
    return el;
  },
  // Upgrades hint to urgent state (call when quota exhausted)
  upgradeHint:function(type){
    var el=document.getElementById('lsHint_'+type);
    if(!el){return}
    el.innerHTML='<span>'+T.hintUrgent+'</span>';
    el.style.cssText='font-size:12px;color:var(--accent);text-align:center;padding:10px 14px;margin-top:10px;cursor:pointer;background:var(--accent-soft);border:1px solid var(--accent);border-radius:10px;font-weight:600;transition:all .3s';
  }
};

// Auto-inject gear button into nav
document.addEventListener('DOMContentLoaded',function(){
  // Desktop nav
  var nr=document.querySelector('.nr');
  if(nr){
    var themeBtn=nr.querySelector('#themeToggle');
    if(themeBtn){
      var gear=document.createElement('button');
      gear.className='bt';gear.id='settingsBtn';gear.title=T.title;gear.textContent='⚙️';
      gear.addEventListener('click',function(){window.luminaSettings.open()});
      themeBtn.parentNode.insertBefore(gear,themeBtn);
    }
  }
  // Mobile menu
  var mm=document.getElementById('mobileMenu');
  if(mm){
    var settingsLink=document.createElement('a');
    settingsLink.href='#';settingsLink.textContent='⚙️ '+T.title;
    settingsLink.style.cssText='color:var(--accent)';
    settingsLink.addEventListener('click',function(e){
      e.preventDefault();
      mm.classList.remove('open');
      document.body.style.overflow='';
      var burger=document.getElementById('burgerBtn');if(burger)burger.classList.remove('open');
      window.luminaSettings.open();
    });
    // Insert before CWS link
    var cws=mm.querySelector('.mm-cws');
    if(cws)mm.insertBefore(settingsLink,cws);
    else mm.appendChild(settingsLink);
  }
});
})();
