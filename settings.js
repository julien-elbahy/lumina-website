/* Lumina Settings — Global API Key Management */
(function(){
var LS={oai:'lumina_key_openai',dfs:'lumina_key_dataforseo'};
var isDE=document.documentElement.lang==='de'||location.pathname.startsWith('/de/');
var T={
  title:isDE?'API-Einstellungen':'API Settings',
  oaiLabel:'OpenAI API Key',
  oaiHelp:isDE?'Für KI-Funktionen (Title-Generator, Schema-Generator, AI Fix). Der Key bleibt in deinem Browser.':'Used by AI features (title generator, schema generator, AI fix). Key stays in your browser.',
  oaiPlaceholder:'sk-...',
  dfsLabel:'DataForSEO',
  dfsHelp:isDE?'Für Keyword Research, SERP Checker, SERP Overlap. Daten werden sicher in deinem Browser gespeichert.':'Used by Keyword Research, SERP Checker, SERP Overlap. Credentials stay in your browser.',
  dfsUser:isDE?'Benutzername':'Username',
  dfsPass:isDE?'Passwort':'Password',
  gscLabel:'Google Search Console',
  gscConnected:isDE?'Verbunden':'Connected',
  gscNot:isDE?'Nicht verbunden':'Not connected',
  gscConnect:isDE?'Mit Google verbinden':'Connect with Google',
  gscDisconnect:isDE?'Trennen':'Disconnect',
  gscHelp:isDE?'Für Keyword-Daten mit echten Klicks, Impressionen und Positionen aus deiner Search Console.':'For keyword data with real clicks, impressions, and positions from your Search Console.',
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
    dfsRow()+
    gscRow()+
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
  wireDfs();
  wireGsc();

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

function dfsRow(){
  var saved=localStorage.getItem(LS.dfs);
  var badgeCls=saved?'on':'off';
  var badgeTxt=saved?T.saved:T.notSet;
  return '<div class="ls-section">'+
    '<div class="ls-row-header"><span class="ls-label">'+T.dfsLabel+'</span><span class="ls-badge '+badgeCls+'" id="lsBadge_dfs">'+badgeTxt+'</span></div>'+
    '<div class="ls-input-wrap"><input type="text" id="lsDfsUser" placeholder="'+T.dfsUser+'" style="flex:1"></div>'+
    '<div class="ls-input-wrap"><input type="password" id="lsDfsPass" placeholder="'+T.dfsPass+'" style="flex:1"><button class="ls-eye" id="lsEye_dfs" title="'+T.show+'">👁</button></div>'+
    '<div class="ls-btns"><button class="ls-btn ls-btn-save" id="lsSave_dfs">'+T.save+'</button><button class="ls-btn ls-btn-del" id="lsDel_dfs">'+T.del+'</button></div>'+
    '<div class="ls-status" id="lsStatus_dfs"></div>'+
    '<p class="ls-help">'+T.dfsHelp+'</p></div>';
}

function wireDfs(){
  var userIn=document.getElementById('lsDfsUser');
  var passIn=document.getElementById('lsDfsPass');
  var eye=document.getElementById('lsEye_dfs');
  var save=document.getElementById('lsSave_dfs');
  var del=document.getElementById('lsDel_dfs');
  var badge=document.getElementById('lsBadge_dfs');
  var status=document.getElementById('lsStatus_dfs');
  var saved=localStorage.getItem(LS.dfs);

  if(saved){
    try{var decoded=atob(saved);var parts=decoded.split(':');userIn.value=parts[0]||'';passIn.value='••••••••';passIn._isDots=true}catch(e){userIn.value='';passIn.value=''}
  }

  eye.addEventListener('click',function(){
    if(passIn.type==='password'){passIn.type='text';if(passIn._isDots&&saved){try{passIn.value=atob(saved).split(':').slice(1).join(':')}catch(e){}}eye.title=T.hide}
    else{passIn.type='password';eye.title=T.show}
  });

  save.addEventListener('click',function(){
    var u=userIn.value.trim(),p=passIn._isDots&&saved?atob(saved).split(':').slice(1).join(':'):passIn.value;
    if(!u||!p)return;
    var encoded=btoa(u+':'+p);
    localStorage.setItem(LS.dfs,encoded);
    saved=encoded;
    passIn.type='password';passIn.value='••••••••';passIn._isDots=true;
    badge.textContent=T.saved;badge.className='ls-badge on';
    status.textContent=T.savedOk;status.style.color='var(--ok)';
    setTimeout(function(){status.textContent=''},2000);
  });

  del.addEventListener('click',function(){
    localStorage.removeItem(LS.dfs);saved=null;
    userIn.value='';passIn.value='';passIn._isDots=false;passIn.type='password';
    badge.textContent=T.notSet;badge.className='ls-badge off';
    status.textContent=T.deletedOk;status.style.color='var(--muted)';
    setTimeout(function(){status.textContent=''},2000);
  });
}

var GSC_CLIENT_ID='128725149604-7fjs4kr00b43bhq9jnsr0slr1fcd1fl9.apps.googleusercontent.com';
var GSC_SCOPES='https://www.googleapis.com/auth/webmasters.readonly';

function gscRow(){
  var gscToken=localStorage.getItem('lumina_gsc_token');
  var gscExpiry=parseInt(localStorage.getItem('lumina_gsc_expiry')||'0');
  var connected=!!gscToken&&Date.now()<gscExpiry;
  return '<div class="ls-section">'+
    '<div class="ls-row-header"><span class="ls-label">'+T.gscLabel+'</span><span class="ls-badge '+(connected?'on':'off')+'" id="lsGscBadge">'+(connected?T.gscConnected:T.gscNot)+'</span></div>'+
    '<div class="ls-btns" id="lsGscBtns">'+
    (connected?'<button class="ls-btn ls-btn-del" id="lsGscDisconnect">'+T.gscDisconnect+'</button>':'<button class="ls-btn ls-btn-save" id="lsGscConnect">'+T.gscConnect+'</button>')+
    '</div>'+
    '<p class="ls-help">'+T.gscHelp+'</p></div>';
}

function wireGsc(){
  var connectBtn=document.getElementById('lsGscConnect');
  var disconnectBtn=document.getElementById('lsGscDisconnect');

  if(connectBtn){
    connectBtn.addEventListener('click',function(){
      var redirect=window.location.origin+window.location.pathname;
      window.location.href='https://accounts.google.com/o/oauth2/v2/auth?client_id='+encodeURIComponent(GSC_CLIENT_ID)+'&redirect_uri='+encodeURIComponent(redirect)+'&response_type=token&scope='+encodeURIComponent(GSC_SCOPES)+'&prompt=consent';
    });
  }

  if(disconnectBtn){
    disconnectBtn.addEventListener('click',function(){
      localStorage.removeItem('lumina_gsc_token');
      localStorage.removeItem('lumina_gsc_expiry');
      var badge=document.getElementById('lsGscBadge');
      badge.textContent=T.gscNot;badge.className='ls-badge off';
      var btns=document.getElementById('lsGscBtns');
      btns.innerHTML='<button class="ls-btn ls-btn-save" id="lsGscConnect">'+T.gscConnect+'</button>';
      wireGsc();
    });
  }
}

function escHandler(e){if(e.key==='Escape')closeModal()}

function closeModal(){
  if(!modal)return;
  modal.classList.remove('open');
  setTimeout(function(){if(modal){modal.remove();modal=null}},200);
  document.removeEventListener('keydown',escHandler);
}

// ── Global Quota Tracker ──
// Persists per-tool quota in localStorage so it survives page reloads
var QUOTA_KEY='lumina_quota_v2';
function _qToday(){return new Date().toISOString().split('T')[0]}
function _qLoad(){try{return JSON.parse(localStorage.getItem(QUOTA_KEY)||'{}')}catch(e){return{}}}
function _qSave(d){try{localStorage.setItem(QUOTA_KEY,JSON.stringify(d))}catch(e){}}

window.luminaQuota={
  // Update quota after API response: luminaQuota.update('keyword-research', data)
  update:function(tool,data){
    if(!data||!data._lumina)return;
    var all=_qLoad();
    all[tool]={
      remaining:data._lumina.remaining,
      limit:data._lumina.limit,
      ownKey:!!data._lumina.ownKey,
      date:_qToday()
    };
    _qSave(all);
    this._render(tool);
  },
  // Get stored quota for a tool
  get:function(tool){
    var all=_qLoad();
    var d=all[tool];
    if(d&&d.date===_qToday())return d;
    return null;
  },
  // Render the quota bar for a tool (creates element if needed)
  _render:function(tool){
    var el=document.getElementById('lq_'+tool);
    if(!el)return;
    var d=this.get(tool);
    if(!d){el.textContent='';return}
    if(d.ownKey){el.textContent=isDE?'Eigener API-Key (unbegrenzt)':'Using your API key (unlimited)';el.style.color='var(--ok)';return}
    var r=d.remaining!=null?d.remaining:'?';
    var l=d.limit||'?';
    el.textContent=(isDE?'Kontingent: ':'Quota: ')+r+'/'+l+(isDE?' heute verbleibend':' remaining today');
    el.style.color=r<=1?'var(--err)':r<=Math.ceil(l/3)?'var(--warn)':'var(--muted)';
  },
  // Create a quota display element and attach to a container
  createBar:function(tool,container){
    if(!container)return null;
    var el=document.createElement('div');
    el.id='lq_'+tool;
    el.style.cssText='font-size:11px;text-align:center;margin-top:6px;font-family:var(--mono);min-height:16px;transition:color .3s';
    container.appendChild(el);
    // Load stored quota on page load
    var d=this.get(tool);
    if(d)this._render(tool);
    return el;
  }
};

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
  // Mobile menu — settings button already in .mm-actions, no extra link needed

  // Auto-inject breadcrumb on tool pages
  var path=location.pathname;
  if(path.indexOf('/tools/')!==-1&&path!=='/tools/'&&path!=='/de/tools/'){
    var isToolDE=path.startsWith('/de/');
    var container=document.querySelector('.container,.ct');
    if(container){
      var bc=document.createElement('nav');
      bc.setAttribute('aria-label','Breadcrumb');
      bc.style.cssText='font-size:12px;color:var(--muted);margin-bottom:12px;font-family:var(--font)';
      var home=isToolDE?'/de/':'/';
      var toolsHref=isToolDE?'/de/tools/':'/tools/';
      var toolsLabel=isToolDE?'Tools':'Tools';
      var h1=document.querySelector('h1');
      var toolName=h1?h1.textContent:'';
      bc.innerHTML='<a href="'+home+'" style="color:var(--muted);transition:color .2s">Lumina</a> <span style="margin:0 6px;opacity:.5">›</span> <a href="'+toolsHref+'" style="color:var(--muted);transition:color .2s">'+toolsLabel+'</a> <span style="margin:0 6px;opacity:.5">›</span> <span style="color:var(--text2)">'+toolName+'</span>';
      bc.querySelectorAll('a').forEach(function(a){a.addEventListener('mouseenter',function(){a.style.color='var(--accent)'});a.addEventListener('mouseleave',function(){a.style.color='var(--muted)'})});
      container.insertBefore(bc,container.firstChild);
    }
  }

  // Reduce excessive footer whitespace
  var footer=document.querySelector('.tf,footer');
  if(footer){footer.style.marginTop='0'}
});
})();
