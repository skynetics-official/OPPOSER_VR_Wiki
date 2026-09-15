
(function(){
var D=window.WIKI_DATA||{};
var sections=document.querySelectorAll('.section');
var nav=document.querySelectorAll('.nav button[data-section]');
var selected=[];
var labelMap={};
var categoryTags=[];
var detailTags=[];
var i;

function hasClass(el,n){return (' '+el.className+' ').indexOf(' '+n+' ')>=0;}
function addClass(el,n){if(!hasClass(el,n))el.className+=(el.className?' ':'')+n;}
function removeClass(el,n){el.className=(' '+el.className+' ').replace(' '+n+' ',' ').replace(/^\s+|\s+$/g,'');}
function setActive(el,on){if(on)addClass(el,'active');else removeClass(el,'active');}
function byId(id){return document.getElementById(id);}
function esc(s){s=String(s==null?'':s);return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function enc(s){return encodeURIComponent(String(s));}
function dec(s){try{return decodeURIComponent(s);}catch(e){return s;}}
function contains(arr,v){for(var x=0;x<arr.length;x++)if(arr[x]===v)return true;return false;}
function removeVal(arr,v){var out=[];for(var x=0;x<arr.length;x++)if(arr[x]!==v)out.push(arr[x]);return out;}
function clearNode(el){while(el&&el.firstChild)el.removeChild(el.firstChild);}
function setHTML(id,html){var el=byId(id);if(el)el.innerHTML=html;}

function show(id){
 for(i=0;i<sections.length;i++)setActive(sections[i],sections[i].id===id);
 for(i=0;i<nav.length;i++)setActive(nav[i],nav[i].getAttribute('data-section')===id);
 var sb=document.querySelector('.sidebar');if(sb)removeClass(sb,'drawer');
 if(window.scrollTo)window.scrollTo(0,0);
}
for(i=0;i<nav.length;i++)nav[i].onclick=function(){show(this.getAttribute('data-section'));location.hash=this.getAttribute('data-section');};
var gotos=document.querySelectorAll('[data-goto]');for(i=0;i<gotos.length;i++)gotos[i].onclick=function(){var id=this.getAttribute('data-goto');show(id);location.hash=id;};

function itemTagHTML(t){return '<span class="tag '+(t.kind==='detail'?'blue':'')+'">'+esc(t.label)+'</span>';}
function itemCard(x){var tags='';var ts=x.tags||[];for(var j=0;j<ts.length&&j<3;j++)tags+=itemTagHTML(ts[j]);if(x.admin_private)tags+='<span class="tag admin-private">ADMIN / PRIVATE</span>';return '<article class="card clickable item-card" data-itemid="'+esc(x.id)+'"><div class="tags">'+tags+'</div><h3>'+esc(x.name)+'</h3><p>'+esc(x.detail)+'</p></article>';}
function bindItems(root){root=root||document;var els=root.querySelectorAll('.item-card');for(var j=0;j<els.length;j++)els[j].onclick=function(){openItem(this.getAttribute('data-itemid'));};}
function openItem(id){var x=null;for(var j=0;j<(D.items||[]).length;j++)if(D.items[j].id===id){x=D.items[j];break;}if(!x)return;var tags='';var ts=x.tags||[];for(var z=0;z<ts.length;z++)tags+=itemTagHTML(ts[z]);if(x.admin_private)tags+='<span class="tag admin-private">ADMIN / PRIVATE</span>';setHTML('itemModalContent','<div class="tags">'+tags+'</div><h2>'+esc(x.name)+'</h2><div class="detail"><b>Порядок</b><span>#'+x.order+' из '+(D.items||[]).length+'</span></div><div class="detail"><b>Категория</b><span>'+esc(x.category)+'</span></div><div class="detail"><b>Подтип</b><span>'+esc(x.detail)+'</span></div><div class="detail"><b>Источник названия</b><span>Admin → SPAWN ITEM</span></div>');openModal('itemModal');}
function openModal(id){var el=byId(id);if(el)addClass(el,'open');}
function closeModal(id){var el=byId(id);if(el)removeClass(el,'open');}
var closes=document.querySelectorAll('[data-close]');for(i=0;i<closes.length;i++)closes[i].onclick=function(){closeModal(this.getAttribute('data-close'));};
var modals=document.querySelectorAll('.modal');for(i=0;i<modals.length;i++)modals[i].onclick=function(e){e=e||window.event;if(e.target===this)removeClass(this,'open');};

function fillCards(id,arr){var html='';for(var j=0;j<arr.length;j++)html+=itemCard(arr[j]);setHTML(id,html);var el=byId(id);if(el)bindItems(el);}
var firearms=[],melee=[],attach=[],other=[];
for(i=0;i<(D.items||[]).length;i++){var x=D.items[i];if(x.category==='Firearm / launcher')firearms.push(x);else if(x.category==='Melee'||x.category==='Shield')melee.push(x);else if(x.category==='Attachment')attach.push(x);else other.push(x);}
fillCards('weaponGrid',firearms);fillCards('meleeGrid',melee);fillCards('attachmentGrid',attach);fillCards('otherGrid',other);
var full='<table class="list-table"><thead><tr><th>#</th><th>Название</th><th>Категория</th><th>Подтип</th></tr></thead><tbody>';
for(i=0;i<(D.items||[]).length;i++){var q=D.items[i];full+='<tr><td>'+q.order+'</td><td>'+esc(q.name)+'</td><td>'+esc(q.category)+'</td><td>'+esc(q.detail)+'</td></tr>';}
full+='</tbody></table>';setHTML('fullTable',full);

// Tags. Same logic as the current site: OR within one tag kind, AND between kinds.
for(i=0;i<(D.tags||[]).length;i++){var t=D.tags[i];labelMap[t.key]=t.label;if(t.kind==='category')categoryTags.push(t);else if(t.kind==='detail')detailTags.push(t);}
function loadTags(){var s=location.search||'';var m=s.match(/[?&]tags=([^&]+)/);if(!m)return;var vals=dec(m[1]).split(',');for(var j=0;j<vals.length;j++)if(labelMap[vals[j]])selected.push(vals[j]);}
function saveTags(){if(!window.history||!history.replaceState)return;var base=location.pathname;var search=selected.length?'?tags='+enc(selected.join(',')):'';try{history.replaceState(null,'',base+search+location.hash);}catch(e){}}
function selectedByKind(){var g={category:[],detail:[],meta:[]};for(var j=0;j<selected.length;j++){var k=selected[j];var kind=k.split(':')[0];if(!g[kind])g[kind]=[];g[kind].push(k);}return g;}
function itemHas(x,key){var ts=x.tags||[];for(var j=0;j<ts.length;j++)if(ts[j].key===key)return true;return false;}
function filtered(){var g=selectedByKind();var out=[];for(var j=0;j<(D.items||[]).length;j++){var x=D.items[j],ok=true;var kinds=['category','detail','meta'];for(var ki=0;ki<kinds.length;ki++){var arr=g[kinds[ki]]||[];if(arr.length){var hit=false;for(var z=0;z<arr.length;z++)if(itemHas(x,arr[z])){hit=true;break;}if(!hit){ok=false;break;}}}if(ok)out.push(x);}return out;}
function toggleTag(k){if(contains(selected,k))selected=removeVal(selected,k);else selected.push(k);saveTags();renderFilters();}
function clearTags(){selected=[];saveTags();renderFilters();}
function filterButton(t){return '<button class="filter-btn '+(contains(selected,t.key)?'selected':'')+'" data-tagkey="'+esc(t.key)+'">'+esc(t.label)+' <span class="count">'+t.count+'</span></button>';}
function bindFilterButtons(){var bs=document.querySelectorAll('[data-tagkey]');for(var j=0;j<bs.length;j++)bs[j].onclick=function(){toggleTag(this.getAttribute('data-tagkey'));};var cs=document.querySelectorAll('[data-clearall]');for(j=0;j<cs.length;j++)cs[j].onclick=clearTags;var rs=document.querySelectorAll('[data-remove-tag]');for(j=0;j<rs.length;j++)rs[j].onclick=function(){selected=removeVal(selected,this.getAttribute('data-remove-tag'));saveTags();renderFilters();};}
function renderFilters(){
 var cats=byId('categoryFilters'),details=byId('detailFilters'),cloud=byId('allTagCloud'),html='',j;
 if(cats){html='<button class="filter-btn '+(selected.length===0?'selected':'')+'" data-clearall="1">Все</button>';for(j=0;j<categoryTags.length;j++)html+=filterButton(categoryTags[j]);cats.innerHTML=html;}
 var g=selectedByKind(),visible=detailTags;if(g.category.length){var related={};for(j=0;j<(D.items||[]).length;j++){var item=D.items[j],match=false;for(var c=0;c<g.category.length;c++)if(itemHas(item,g.category[c])){match=true;break;}if(match){var ts=item.tags||[];for(var u=0;u<ts.length;u++)if(ts[u].kind==='detail')related[ts[u].key]=true;}}visible=[];for(j=0;j<detailTags.length;j++)if(related[detailTags[j].key])visible.push(detailTags[j]);}
 if(details){html='';for(j=0;j<visible.length;j++)html+=filterButton(visible[j]);details.innerHTML=html;}
 if(cloud){html='';var all=categoryTags.concat(detailTags);for(j=0;j<all.length;j++)html+='<button class="tag-btn '+(contains(selected,all[j].key)?'selected':'')+'" data-tagkey="'+esc(all[j].key)+'">'+esc(all[j].label)+' <span>'+all[j].count+'</span></button>';cloud.innerHTML=html;}
 var arr=filtered();fillCards('itemGrid',arr);fillCards('tagResults',arr);if(byId('itemCount'))byId('itemCount').innerHTML=arr.length;if(byId('tagResultCount'))byId('tagResultCount').innerHTML=arr.length+' шт.';
 var summary=byId('quickFilterSummary');if(summary){if(selected.length){html='<span class="muted">Выбрано:</span> ';for(j=0;j<selected.length;j++)html+='<button class="selected-chip" data-remove-tag="'+esc(selected[j])+'">'+esc(labelMap[selected[j]]||selected[j])+' <b>×</b></button>';summary.innerHTML=html;}else summary.innerHTML='<span class="muted">Фильтр: Все items</span>';}
 var st=byId('selectedTagsText');if(st){var labs=[];for(j=0;j<selected.length;j++)labs.push(labelMap[selected[j]]||selected[j]);st.innerHTML=labs.length?esc(labs.join(' + ')):'ничего — показываются все items';}
 var badge=byId('tagFilterBadge');if(badge){badge.innerHTML=selected.length;badge.style.display=selected.length?'inline':'none';}
 bindFilterButtons();
}
loadTags();if(byId('clearQuickFilters'))byId('clearQuickFilters').onclick=clearTags;if(byId('clearTagsPage'))byId('clearTagsPage').onclick=clearTags;renderFilters();

// Admin commands
var helpObj={};for(i=0;i<(D.admin_command_details||[]).length;i++)helpObj[D.admin_command_details[i].name]=D.admin_command_details[i];
function commandCard(name){var h=helpObj[name]||{};return '<div class="admin-command"><div class="admin-command-top"><code>'+esc(name)+'</code><span class="verify-badge '+esc(h.verified||'partial')+'">'+((h.verified==='verified')?'описание подтверждено':'частично подтверждено')+'</span></div><p>'+esc(h.short||'Admin command.')+'</p><div class="command-actions"><button class="more-command" data-command="'+esc(name)+'">Подробнее</button><button class="copy-command" data-copy="'+esc(name)+'">Копировать</button></div></div>';}
var admin='';for(i=0;i<(D.admin_command_groups||[]).length;i++){var ag=D.admin_command_groups[i];admin+='<section class="admin-group"><div class="admin-group-head"><h3>'+esc(ag.title)+'</h3><span>'+ag.commands.length+'</span></div><div class="admin-command-list">';for(var a=0;a<ag.commands.length;a++)admin+=commandCard(ag.commands[a]);admin+='</div></section>';}setHTML('adminGrid',admin);
function linkify(s){s=esc(s||'');return s.replace(/(https:\/\/[^\s&lt;]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');}
function openCommand(name,push){var h=helpObj[name];if(!h)return;var steps='';for(var j=0;j<(h.steps||[]).length;j++)steps+='<div class="command-step">'+esc(h.steps[j])+'</div>';var input=h.input?'<div class="detail"><b>Что вводить</b><span>'+esc(h.input)+'</span></div>':'';var ex=h.example?'<div class="callout"><b>Пример:</b> '+esc(h.example)+'</div>':'';var note=h.note?'<div class="callout"><b>Примечание:</b> '+linkify(h.note)+'</div>':'';setHTML('commandModalContent','<div class="tags"><span class="tag">'+esc(h.group)+'</span></div><h2>'+esc(h.name)+'</h2><p>'+esc(h.what)+'</p>'+input+'<h3>Как использовать</h3><div>'+steps+'</div>'+ex+note);openModal('commandModal');if(push!==false&&window.history&&history.replaceState)try{history.replaceState(null,'',location.pathname+location.search+'#command-'+enc(name));}catch(e){};}
function copyText(text,btn){var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');if(btn){btn.innerHTML='Скопировано';setTimeout(function(){btn.innerHTML='Копировать';},1000);}}catch(e){}document.body.removeChild(ta);}
var more=document.querySelectorAll('.more-command');for(i=0;i<more.length;i++)more[i].onclick=function(){openCommand(this.getAttribute('data-command'));};var cp=document.querySelectorAll('.copy-command');for(i=0;i<cp.length;i++)cp[i].onclick=function(){copyText(this.getAttribute('data-copy'),this);};
if(byId('adminCount'))byId('adminCount').innerHTML=(D.admin_commands||[]).length;

// Maps
var maps='';for(i=0;i<(D.maps||[]).length;i++){var m=D.maps[i];maps+='<article class="card"><div class="map-cover"><img src="'+esc(m.image)+'" alt="'+esc(m.name)+'" onerror="this.style.display=\'none\';this.nextSibling.style.display=\'block\'"><div class="map-image-fallback">Изображение не загрузилось</div></div><div class="tags"><span class="tag blue">'+esc(m.status)+'</span></div><h3>'+esc(m.name)+'</h3><p>'+esc(m.desc)+'</p><div class="detail"><b>Admin name</b><span>'+esc(m.admin_name)+'</span></div><div class="image-note">'+esc(m.image_note)+'</div></article>';}
setHTML('mapsGrid',maps);
var ex='';for(i=0;i<(D.explain_cards||[]).length;i++)ex+='<article class="card"><h3>'+esc(D.explain_cards[i].title)+'</h3><p>'+esc(D.explain_cards[i].text)+'</p></article>';setHTML('explainGrid',ex);
var sl='';for(i=0;i<(D.sources||[]).length;i++)sl+='<a href="'+esc(D.sources[i].url)+'" target="_blank" rel="noopener">↗ '+esc(D.sources[i].label)+'</a>';setHTML('sourceLinks',sl);

// Badges / passes
var badgeGroup='current';function badgeCard(x){var status=x.group==='disabled'?'<span class="tag gray">ОТКЛЮЧЁН</span>':x.group==='additional'?'<span class="tag blue">СЕЗОННЫЙ / ДОП.</span>':'<span class="tag green">BADGE</span>';return '<article class="card"><div class="tags">'+status+(x.id?'<span class="tag gray">ID '+esc(x.id)+'</span>':'')+'</div><h3>'+esc(x.name)+'</h3><p>'+esc(x.desc)+'</p></article>';}
function renderBadges(){var arr=[];for(var j=0;j<(D.badges||[]).length;j++)if(badgeGroup==='all'||D.badges[j].group===badgeGroup)arr.push(D.badges[j]);var html='';for(j=0;j<arr.length;j++)html+=badgeCard(arr[j]);setHTML('badgeGrid',html);if(byId('badgeCount'))byId('badgeCount').innerHTML=arr.length;var fs=document.querySelectorAll('.badge-filter');for(j=0;j<fs.length;j++)setActive(fs[j],fs[j].getAttribute('data-badgegroup')===badgeGroup);}
var bfs=document.querySelectorAll('.badge-filter');for(i=0;i<bfs.length;i++)bfs[i].onclick=function(){badgeGroup=this.getAttribute('data-badgegroup');renderBadges();};renderBadges();
var passes='';for(i=0;i<(D.gamepasses||[]).length;i++){var p=D.gamepasses[i];passes+='<article class="card"><div class="tags"><span class="tag">'+esc(p.price)+'</span><span class="tag blue">'+esc(p.compat)+'</span>'+(p.id?'<span class="tag gray">ID '+esc(p.id)+'</span>':'')+'</div><h3>'+esc(p.name)+'</h3><p>'+esc(p.desc)+'</p></article>';}setHTML('passGrid',passes);if(byId('passCount'))byId('passCount').innerHTML=(D.gamepasses||[]).length;
var sf='';for(i=0;i<(D.store_features||[]).length;i++){var f=D.store_features[i];sf+='<article class="card"><div class="tags"><span class="tag gray">'+esc(f.price)+'</span></div><h3>'+esc(f.name)+'</h3><p>'+esc(f.desc)+'</p></article>';}setHTML('storeFeatureGrid',sf);

// Search
function lower(s){return String(s||'').toLowerCase();}function search(q){q=lower(q).replace(/^\s+|\s+$/g,'');var panel=byId('searchPanel'),box=byId('searchResults');if(!q){if(panel)removeClass(panel,'active');return;}var html='',j,x;for(j=0;j<(D.items||[]).length;j++){x=D.items[j];if(lower(x.name+' '+x.category+' '+x.detail).indexOf(q)>=0)html+=itemCard(x);}for(j=0;j<(D.admin_command_details||[]).length;j++){x=D.admin_command_details[j];if(lower(x.name+' '+x.short+' '+x.what).indexOf(q)>=0)html+='<article class="card clickable command-search" data-command="'+esc(x.name)+'"><span class="tag">Admin Command</span><h3>'+esc(x.name)+'</h3><p>'+esc(x.short)+'</p></article>';}for(j=0;j<(D.badges||[]).length;j++){x=D.badges[j];if(lower(x.name+' '+x.desc).indexOf(q)>=0)html+='<article class="card"><span class="tag green">Badge</span><h3>'+esc(x.name)+'</h3><p>'+esc(x.desc)+'</p></article>';}for(j=0;j<(D.gamepasses||[]).length;j++){x=D.gamepasses[j];if(lower(x.name+' '+x.desc+' '+x.compat).indexOf(q)>=0)html+='<article class="card"><span class="tag">'+esc(x.price)+'</span><h3>'+esc(x.name)+'</h3><p>'+esc(x.desc)+'</p></article>';}if(panel)addClass(panel,'active');show('home');if(box){box.innerHTML=html||'<div class="notice">Ничего не найдено.</div>';bindItems(box);var cs=box.querySelectorAll('.command-search');for(j=0;j<cs.length;j++)cs[j].onclick=function(){openCommand(this.getAttribute('data-command'));};}}
var si=[byId('search'),byId('searchMobile')];for(i=0;i<si.length;i++)if(si[i])si[i].onkeyup=function(){search(this.value);};

// Menu and routing
if(byId('menuBtn'))byId('menuBtn').onclick=function(){var sb=document.querySelector('.sidebar');if(hasClass(sb,'drawer'))removeClass(sb,'drawer');else addClass(sb,'drawer');};if(byId('closeDrawer'))byId('closeDrawer').onclick=function(){removeClass(document.querySelector('.sidebar'),'drawer');};
var liteLink=byId('liteLink');if(liteLink)liteLink.href='lite.html'+location.search+location.hash;
var h=location.hash||'';if(h.indexOf('#command-')===0){show('admin');openCommand(dec(h.substring(9)),false);}else{var id=h.substring(1);if(id&&byId(id))show(id);else if(selected.length)show('items');else show('home');}
})();
