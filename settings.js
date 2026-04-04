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
  gscSite:isDE?'Property':'Property',
  gscSiteHelp:isDE?'Wähle die GSC-Property für Datenabfragen.':'Select the GSC property for data queries.',
  gscLoading:isDE?'Lade Properties…':'Loading properties…',
  gscNoSites:isDE?'Keine Properties gefunden':'No properties found',
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
var GSC_WORKER='https://lumina-proxy.julien-elbahy.workers.dev/gsc-token';

/* ── PKCE helpers ── */
function gscGenVerifier(){var a=new Uint8Array(32);crypto.getRandomValues(a);return btoa(String.fromCharCode.apply(null,a)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function gscGenChallenge(v){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)).then(function(h){return btoa(String.fromCharCode.apply(null,new Uint8Array(h))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')})}

/* ── Token refresh (via Worker) ── */
window.luminaGscRefresh=function(cb){
  var rt=localStorage.getItem('lumina_gsc_refresh');
  if(!rt){if(cb)cb(null);return}
  fetch(GSC_WORKER,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({grant_type:'refresh_token',refresh_token:rt})})
    .then(function(r){return r.json()}).then(function(d){
      if(d.access_token){
        localStorage.setItem('lumina_gsc_token',d.access_token);
        localStorage.setItem('lumina_gsc_expiry',String(Date.now()+(d.expires_in||3600)*1000));
        if(cb)cb(d.access_token);
      }else{
        localStorage.removeItem('lumina_gsc_token');localStorage.removeItem('lumina_gsc_expiry');localStorage.removeItem('lumina_gsc_refresh');
        if(cb)cb(null);
      }
    }).catch(function(){if(cb)cb(null)});
};

/* Auto-refresh on page load if token is expired but refresh token exists */
(function(){
  var token=localStorage.getItem('lumina_gsc_token');
  var expiry=parseInt(localStorage.getItem('lumina_gsc_expiry')||'0');
  var refresh=localStorage.getItem('lumina_gsc_refresh');
  if(refresh&&(!token||Date.now()>expiry-60000)){window.luminaGscRefresh()}
})();

function gscRow(){
  var gscToken=localStorage.getItem('lumina_gsc_token');
  var gscExpiry=parseInt(localStorage.getItem('lumina_gsc_expiry')||'0');
  var gscRefresh=localStorage.getItem('lumina_gsc_refresh');
  var connected=(!!gscToken&&Date.now()<gscExpiry)||!!gscRefresh;
  if(!connected){
    return '<div class="ls-section">'+
      '<div class="ls-row-header"><span class="ls-label">'+T.gscLabel+'</span><span class="ls-badge off" id="lsGscBadge">'+T.gscNot+'</span></div>'+
      '<div class="ls-btns" id="lsGscBtns"><button class="ls-btn ls-btn-save" id="lsGscConnect">'+T.gscConnect+'</button></div>'+
      '<p class="ls-help">'+T.gscHelp+'</p></div>';
  }
  return '<div class="ls-section">'+
    '<div class="ls-row-header"><span class="ls-label">'+T.gscLabel+'</span><span class="ls-badge on" id="lsGscBadge">'+T.gscConnected+'</span></div>'+
    '<div class="ls-gsc-prop" id="lsGscSiteWrap"><span class="ls-label" style="font-size:10px;margin-bottom:4px;display:block">'+T.gscSite+'</span><select id="lsGscSite" style="width:100%;padding:8px 10px;background:var(--input-bg,rgba(0,0,0,.15));border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--font);font-size:13px;outline:none;cursor:pointer"><option value="">'+T.gscLoading+'</option></select></div>'+
    '<div class="ls-btns" id="lsGscBtns" style="margin-top:8px"><button class="ls-btn ls-btn-del" id="lsGscDisconnect">'+T.gscDisconnect+'</button></div>'+
    '<p class="ls-help">'+T.gscHelp+'</p></div>';
}

function wireGsc(){
  var connectBtn=document.getElementById('lsGscConnect');
  var disconnectBtn=document.getElementById('lsGscDisconnect');

  if(connectBtn){
    connectBtn.addEventListener('click',function(){
      var redirect=window.location.origin+'/auth-handler/';
      var state=encodeURIComponent(window.location.pathname);
      var verifier=gscGenVerifier();
      sessionStorage.setItem('lumina_gsc_verifier',verifier);
      gscGenChallenge(verifier).then(function(challenge){
        window.location.href='https://accounts.google.com/o/oauth2/v2/auth?client_id='+encodeURIComponent(GSC_CLIENT_ID)+'&redirect_uri='+encodeURIComponent(redirect)+'&response_type=code&scope='+encodeURIComponent(GSC_SCOPES)+'&state='+state+'&prompt=consent&access_type=offline&code_challenge='+encodeURIComponent(challenge)+'&code_challenge_method=S256';
      });
    });
  }

  if(disconnectBtn){
    disconnectBtn.addEventListener('click',function(){
      localStorage.removeItem('lumina_gsc_token');
      localStorage.removeItem('lumina_gsc_expiry');
      localStorage.removeItem('lumina_gsc_refresh');
      localStorage.removeItem('lumina_gsc_site');
      var badge=document.getElementById('lsGscBadge');
      badge.textContent=T.gscNot;badge.className='ls-badge off';
      var siteWrap=document.getElementById('lsGscSiteWrap');
      if(siteWrap)siteWrap.remove();
      var btns=document.getElementById('lsGscBtns');
      btns.innerHTML='<button class="ls-btn ls-btn-save" id="lsGscConnect">'+T.gscConnect+'</button>';
      wireGsc();
    });
  }

  /* Fetch GSC properties when connected */
  var siteSel=document.getElementById('lsGscSite');
  if(siteSel){
    var token=localStorage.getItem('lumina_gsc_token');
    if(token){
      fetch('https://www.googleapis.com/webmasters/v3/sites',{headers:{'Authorization':'Bearer '+token}})
        .then(function(r){return r.json()})
        .then(function(data){
          var sites=(data.siteEntry||[]).map(function(s){return s.siteUrl});
          if(!sites.length){siteSel.innerHTML='<option value="">'+T.gscNoSites+'</option>';return}
          var saved=localStorage.getItem('lumina_gsc_site')||'';
          siteSel.innerHTML='';
          sites.forEach(function(s){
            var opt=document.createElement('option');
            opt.value=s;opt.textContent=s.replace(/^sc-domain:/,'').replace(/\/$/,'');
            if(s===saved)opt.selected=true;
            siteSel.appendChild(opt);
          });
          /* If nothing saved, save the first one */
          if(!saved||sites.indexOf(saved)===-1){
            localStorage.setItem('lumina_gsc_site',sites[0]);
          }
          siteSel.addEventListener('change',function(){
            localStorage.setItem('lumina_gsc_site',siteSel.value);
          });
          if(window.csUpgrade)csUpgrade(siteSel);
        })
        .catch(function(){siteSel.innerHTML='<option value="">Error</option>'});
    }
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
    el.textContent=r+'/'+l+(isDE?' Credits heute':' credits today');
    el.style.color=r<=1?'var(--err)':r<=Math.ceil(l/3)?'var(--warn)':'var(--muted)';
  },
  // Create a quota display element below the container (card)
  // If element with id lq_TOOL already exists in HTML, reuse it instead of creating new one
  // defaultLimit: if provided, shows "X/X credits today" when no stored data exists
  createBar:function(tool,container,defaultLimit){
    if(!container)return null;
    var el=document.getElementById('lq_'+tool);
    if(!el){
      el=document.createElement('div');
      el.id='lq_'+tool;
      el.style.cssText='font-size:11px;text-align:right;margin-top:4px;padding-right:4px;font-family:var(--mono);min-height:16px;transition:color .3s';
      if(container.nextSibling)container.parentNode.insertBefore(el,container.nextSibling);
      else container.parentNode.appendChild(el);
    }
    // Load stored quota on page load — overrides HTML default if data exists
    var d=this.get(tool);
    if(d){this._render(tool)}
    else if(defaultLimit){el.textContent=defaultLimit+'/'+defaultLimit+(isDE?' Credits heute':' credits today');el.style.color='var(--muted)'}
    return el;
  }
};

// Standardized quota exhaustion error HTML
window.luminaQuotaError=function(){
  return '<div style="padding:14px 16px;border-radius:12px;font-size:13px;font-weight:600;background:var(--err-bg);border:1px solid var(--err-border);color:var(--err);text-align:center">'+(isDE?'Tageslimit erreicht.':'Daily limit reached.')+' <a href="javascript:void(0)" onclick="if(window.luminaSettings)luminaSettings.open()" style="color:var(--accent);text-decoration:underline">'+(isDE?'API-Key hinzuf\u00fcgen':'Add your API key')+'</a> '+(isDE?'f\u00fcr unbegrenzten Zugang.':'for unlimited access.')+'</div>';
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
  // Creates a subtle hint element (legacy — kept for backwards compat)
  createHint:function(){return null},
  upgradeHint:function(){return null}
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

  // ── Custom Searchable Select ──
  // ── Quota row CSS ──
  var lqStyle=document.createElement('style');
  lqStyle.textContent='.lq-row{display:flex;justify-content:space-between;align-items:center;margin-top:4px;min-height:16px;font-size:11px;font-family:var(--mono)}.lq-hint{color:var(--muted);cursor:pointer;transition:color .2s}.lq-hint:hover{color:var(--accent)}.lq-hint span{text-decoration:underline}.lq-credits{color:var(--muted);transition:color .3s}';
  document.head.appendChild(lqStyle);

  // Replaces native <select> with styled, searchable dropdowns
  var csStyle=document.createElement('style');
  csStyle.textContent=
    '.cs-wrap{position:relative;display:inline-flex;vertical-align:middle}'+
    '.cs-trigger{display:inline-flex;align-items:center;gap:6px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;padding:8px 30px 8px 10px;color:var(--text);font-size:12px;font-family:var(--font);cursor:pointer;transition:all .2s;white-space:nowrap;text-align:left;position:relative;min-width:0;max-width:200px;overflow:hidden;text-overflow:ellipsis}'+
    '.cs-trigger:hover{border-color:var(--accent)}.cs-trigger:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow)}'+
    '.cs-trigger::after{content:"";position:absolute;right:10px;top:50%;transform:translateY(-50%);border:4px solid transparent;border-top:5px solid var(--muted);pointer-events:none}'+
    '.cs-wrap.open .cs-trigger::after{border-top:none;border-bottom:5px solid var(--accent)}'+
    '.cs-panel{display:none;position:fixed;width:max-content;max-width:280px;background:var(--bg2);border:1px solid var(--border);border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.4);z-index:99999;overflow:hidden}'+
    '.cs-panel.cs-open{display:block}'+
    '@media(max-width:640px){.cs-panel{border-radius:14px 14px 0 0;max-height:60vh;overflow-y:auto}.cs-opts{max-height:none!important}}'+
    '.cs-search{width:100%;border:none;border-bottom:1px solid var(--border);background:var(--input-bg);color:var(--text);font-size:16px;font-family:var(--font);padding:10px 12px;outline:none;box-sizing:border-box}'+
    '.cs-search::placeholder{color:var(--muted)}'+
    '.cs-opts{max-height:220px;overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none}'+
    '.cs-opts::-webkit-scrollbar{display:none}'+
    '.cs-opt{padding:7px 10px;font-size:12px;color:var(--text2);cursor:pointer;transition:background .1s,color .1s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
    '.cs-opt:hover,.cs-opt.hl{background:var(--accent-soft);color:var(--text)}'+
    '.cs-opt.sel{color:var(--accent);font-weight:700}'+
    '.cs-no{padding:8px 10px;font-size:11px;color:var(--muted);text-align:center}'+
    '[data-theme="light"] .cs-panel{background:rgba(255,255,255,.97);box-shadow:0 8px 32px rgba(100,70,30,.12)}'+
    '[data-theme="light"] .cs-search{background:rgba(245,240,233,.8)}'+
    '[data-theme="light"] .cs-opt:hover,[data-theme="light"] .cs-opt.hl{background:rgba(200,122,48,.08)}'+
    '.cs-wrap select{display:none!important;position:absolute;opacity:0;pointer-events:none}'+
    '.kw-input .cs-trigger{border-radius:12px;padding:10px 30px 10px 12px}'+
    '.loc-row .cs-trigger{border-radius:8px}'+
    '.gsc-bar .cs-trigger{font-family:var(--mono);font-size:11px;padding:6px 28px 6px 10px;min-width:140px}';
  document.head.appendChild(csStyle);

  function csUpgrade(sel){
    if(sel._cs)return;
    sel._cs=true;
    // Wrap
    var wrap=document.createElement('div');wrap.className='cs-wrap';
    sel.parentNode.insertBefore(wrap,sel);wrap.appendChild(sel);
    sel.style.display='none';
    sel.tabIndex=-1;
    // Trigger button
    var btn=document.createElement('button');btn.type='button';btn.className='cs-trigger';
    if(sel.style.minWidth)btn.style.minWidth=sel.style.minWidth;
    btn.textContent=sel.selectedOptions[0]?sel.selectedOptions[0].textContent:'';
    wrap.appendChild(btn);
    // Panel — appended to body to escape backdrop-filter stacking contexts
    var panel=document.createElement('div');panel.className='cs-panel';
    var hasSearch=sel.options.length>6;
    var csLabel=sel.getAttribute('aria-label')||(isDE?'Suchen':'Search');
    panel.innerHTML=(hasSearch?'<input class="cs-search" placeholder="'+(isDE?'Suchen…':'Search…')+'" type="text" autocomplete="off" aria-label="'+csLabel+'">':'')+'<div class="cs-opts"></div>';
    document.body.appendChild(panel);
    var searchIn=panel.querySelector('.cs-search');
    var optBox=panel.querySelector('.cs-opts');
    var hlIdx=-1;
    function getOpts(){return Array.from(optBox.querySelectorAll('.cs-opt'))}
    function render(filter){
      var h='';
      Array.from(sel.options).forEach(function(o,i){
        var txt=o.textContent;
        if(filter&&txt.toLowerCase().indexOf(filter)===-1)return;
        var cls='cs-opt'+(o.selected?' sel':'');
        h+='<div class="'+cls+'" data-i="'+i+'">'+txt+'</div>';
      });
      optBox.innerHTML=h||(hasSearch?'<div class="cs-no">'+(isDE?'Keine Ergebnisse':'No results')+'</div>':'');
      hlIdx=-1;
    }
    function highlight(idx){
      var opts=getOpts();
      opts.forEach(function(o,i){o.classList.toggle('hl',i===idx)});
      if(opts[idx])opts[idx].scrollIntoView({block:'nearest'});
      hlIdx=idx;
    }
    function pick(optEl){
      sel.selectedIndex=parseInt(optEl.dataset.i);
      sel.dispatchEvent(new Event('change',{bubbles:true}));
      btn.textContent=sel.selectedOptions[0].textContent;
      close();
    }
    var isMobile=function(){return window.innerWidth<=640};
    function positionPanel(){
      var r=btn.getBoundingClientRect();
      if(isMobile()){
        // Mobile: bottom-sheet style, full width, anchored to bottom
        panel.style.left='8px';
        panel.style.right='8px';
        panel.style.width='auto';
        panel.style.maxWidth='none';
        panel.style.bottom='0';
        panel.style.top='auto';
        panel.style.borderRadius='14px 14px 0 0';
        panel.style.maxHeight='60vh';
      }else{
        panel.style.bottom='';
        panel.style.right='';
        panel.style.borderRadius='';
        panel.style.maxHeight='';
        var pw=panel.offsetWidth||200;
        var ph=panel.offsetHeight||260;
        var left=r.left;
        if(left+pw>window.innerWidth)left=window.innerWidth-pw-8;
        if(left<4)left=4;
        if(r.bottom+ph+8>window.innerHeight){
          panel.style.top=(r.top-ph-4)+'px';
        }else{
          panel.style.top=(r.bottom+4)+'px';
        }
        panel.style.left=left+'px';
        panel.style.width='max-content';
        panel.style.maxWidth='280px';
        panel.style.minWidth=r.width+'px';
      }
    }
    function open(){
      wrap.classList.add('open');
      render();
      panel.style.visibility='hidden';
      panel.classList.add('cs-open');
      positionPanel();
      panel.style.visibility='';
      // On mobile: don't focus search to prevent scroll jump
      if(searchIn){searchIn.value='';if(!isMobile())searchIn.focus()}
    }
    function close(){
      wrap.classList.remove('open');
      panel.classList.remove('cs-open');
      hlIdx=-1;
    }
    function isOpen(){return panel.classList.contains('cs-open')}
    btn.addEventListener('click',function(e){e.stopPropagation();if(isOpen())close();else open()});
    if(searchIn){searchIn.addEventListener('input',function(){render(this.value.toLowerCase())});
      searchIn.addEventListener('keydown',function(e){
        var opts=getOpts();if(!opts.length)return;
        if(e.key==='ArrowDown'){e.preventDefault();highlight(Math.min(hlIdx+1,opts.length-1))}
        else if(e.key==='ArrowUp'){e.preventDefault();highlight(Math.max(hlIdx-1,0))}
        else if(e.key==='Enter'){e.preventDefault();if(hlIdx>=0&&opts[hlIdx])pick(opts[hlIdx]);else if(opts.length===1)pick(opts[0])}
        else if(e.key==='Escape'){e.preventDefault();close();btn.focus()}
      });
    }
    optBox.addEventListener('click',function(e){var o=e.target.closest('.cs-opt');if(o)pick(o)});
    // Close on click outside — check both wrap and panel since panel is in body
    document.addEventListener('click',function(e){if(!wrap.contains(e.target)&&!panel.contains(e.target))close()});
    // Reposition on resize (not scroll — scroll repositioning causes jitter on mobile)
    window.addEventListener('resize',function(){if(isOpen())positionPanel()});
    // On desktop, reposition on scroll; on mobile, close dropdown on scroll
    window.addEventListener('scroll',function(){if(!isOpen())return;if(isMobile())close();else positionPanel()},true);
    // Allow programmatic updates to sync the trigger text
    var origDesc=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value');
    Object.defineProperty(sel,'value',{
      get:function(){return origDesc.get.call(sel)},
      set:function(v){origDesc.set.call(sel,v);btn.textContent=sel.selectedOptions[0]?sel.selectedOptions[0].textContent:v},
      configurable:true
    });
    // Also catch selectedIndex changes
    var origIdx=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'selectedIndex');
    Object.defineProperty(sel,'selectedIndex',{
      get:function(){return origIdx.get.call(sel)},
      set:function(v){origIdx.set.call(sel,v);btn.textContent=sel.selectedOptions[0]?sel.selectedOptions[0].textContent:''},
      configurable:true
    });
  }

  // Expose csUpgrade globally so tool scripts can upgrade dynamically-populated selects
  window.csUpgrade=csUpgrade;

  // Auto-upgrade all selects with 2+ options (skip GSC site selector which is dynamically populated)
  document.querySelectorAll('select').forEach(function(sel){
    if(sel.options.length>=2&&sel.id!=='gscSite')csUpgrade(sel);
  });

  // ── Auto-init quota bars ──
  // Find all lq_* elements and render stored quota from localStorage
  document.querySelectorAll('[id^="lq_"]').forEach(function(el){
    var tool=el.id.substring(3);
    if(window.luminaQuota){
      var d=window.luminaQuota.get(tool);
      if(d)window.luminaQuota._render(tool);
    }
  });
  // ── Auto-init API key hints ──
  // Hide hint row if user has their own key
  document.querySelectorAll('.lq-hint').forEach(function(el){
    var keyType=el.dataset.key||'dataforseo';
    if(window.luminaSettings&&window.luminaSettings.hasKey(keyType)){el.style.display='none'}
    el.addEventListener('click',function(){if(window.luminaSettings)window.luminaSettings.open()});
  });
});
})();
