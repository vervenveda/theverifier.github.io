"use strict";

const NEWSROOM_DIRECTORY_URL="./data/verifier-newsroom-directory.json";
let APPS=[];
const CATEGORIES={"all":{"label":"All Resources","icon":"▦","description":"Every current Verifier resource."},"live":{"label":"Today’s News","icon":"●","description":"Daily briefings, world coverage, and current reporting."},"interactive":{"label":"Interactive & Feed Tools","icon":"⌘","description":"Interactive explorers, feeds, tickers, and compatibility doorways."},"research":{"label":"Research & Discovery","icon":"⌕","description":"Evidence trails, search engines, portfolios, and source directories."},"science":{"label":"Science, Environment & Data","icon":"⚗","description":"Science reporting, ecological news, and public-interest data."},"learning":{"label":"Education, Kids & News Literacy","icon":"▣","description":"Education coverage, child-aware news, and current-events quizzes."},"archive":{"label":"Archives & Vintage Editions","icon":"N","description":"Historical and newspaper-inspired reading rooms."}};
const EDITORIAL_COLUMNS_URL="./data/verifier-editorial-columns.json";
let COLUMNS=[];
let COLUMN_META={};
async function loadEditorialColumns(){
  const response=await fetch(EDITORIAL_COLUMNS_URL,{cache:"no-store"});
  if(!response.ok)throw new Error("Editorial columns directory request failed: "+response.status);
  const directory=await response.json();
  const entries=Array.isArray(directory.entries)?directory.entries:[];
  const active=entries
    .filter(entry=>entry&&entry.status==="active"&&entry.title&&entry.file)
    .sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999));
  COLUMNS=active.map(entry=>[entry.title,entry.file]);
  COLUMN_META=Object.fromEntries(active.map(entry=>[
    entry.title,
    {beat:entry.beat||"Editorial column",description:entry.description||"Read the latest essays and commentary from this editorial desk."}
  ]));
  if(!COLUMNS.length)throw new Error("Canonical editorial columns directory returned no entries");
}
const MASTER_DIRECTORY_URL="https://vervenveda.com/ecosystem/master-ecosystem-directory.json";
let SITES=[];
const TITLE_BREAKS={"Interactive Live News Dashboard":"Interactive Live<br>News Dashboard","Interactive News Dashboard":"Interactive News<br>Dashboard","The Verifier Daily News Quiz":"The Verifier<br>Daily News Quiz","Financial Learning Library":"Financial Learning<br>Library","Science & Technology":"Science &<br>Technology","Animals & Biodiversity":"Animals &<br>Biodiversity","Religion & Culture":"Religion &<br>Culture","Arts & Humanities":"Arts &<br>Humanities","Health & Lifestyle":"Health &<br>Lifestyle","Khaemenes Kinder Garden":"Khaemenes<br>Kinder Garden","Khaemenes Higher Learning":"Khaemenes<br>Higher Learning","Khaemenes Linguistics":"Khaemenes<br>Linguistics","Khaemenes Elementary":"Khaemenes<br>Elementary","Khaemenes Preschool":"Khaemenes<br>Preschool","Jennifer Pearl 2028":"Jennifer Pearl<br>2028","ProResource Hub":"ProResource<br>Hub","My Art Gallery":"My Art<br>Gallery"};

const FAVORITES_KEY="the-verifier-favorites-v3";
const CURRENT_SITE="theverifier.github.io";
const NETWORK_ANCHORS=["vervenveda.github.io","theverifier.github.io","onenationforall.github.io","PLERASearch.github.io","JenniferPearl2028.github.io"];
const GLOBAL_REGIONS=new Set(["North America","Europe","Global","Oceania"]);
const REQUIRED_IDS=[
  "localClock","appStat","columnStat","repositoryStat",
  "manifestStatus","repositoryManifestStatus","networkTrail","categoryFilter","appGroups",
  "columnGrid","networkGrid","drawerContent","drawer","drawerSearch","drawerClose",
  "favoriteCount","favoritesButton","appSearch","results","empty","randomButton","topButton","toast"
];

const $=id=>document.getElementById(id);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const formatTitle=title=>TITLE_BREAKS[title]||escapeHTML(title);
const appUrl=app=>"./apps/"+encodeURI(app.file);
const columnUrl=file=>"./columns/"+encodeURI(file);
const categoryLabel=key=>CATEGORIES[key]?.label||key;
async function loadNewsroomDirectory(){
  const response=await fetch(NEWSROOM_DIRECTORY_URL,{cache:"no-store"});
  if(!response.ok)throw new Error("Newsroom directory request failed: "+response.status);
  const directory=await response.json();
  const entries=Array.isArray(directory.entries)?directory.entries:[];
  const seenIds=new Set(),seenFiles=new Set();
  APPS=entries
    .filter(entry=>entry&&entry.id&&entry.file)
    .sort((a,b)=>(Number(a.order)||999)-(Number(b.order)||999))
    .filter(entry=>{
      if(seenIds.has(entry.id)||seenFiles.has(entry.file))return false;
      seenIds.add(entry.id);seenFiles.add(entry.file);return true;
    });
  if(!APPS.length)throw new Error("Canonical newsroom directory returned no entries");
}
const healthLabel=health=>health==="needs-content"?"In development":health==="shared-build"?"Specialized workspace":"Open";
const TYPE_LABELS=Object.freeze({newsroom:"Newsroom",directory:"Directory",tool:"Research Tool",quiz:"Learning Tool",compatibility:"Compatibility"});
const typeLabel=type=>TYPE_LABELS[type]||"Resource";
const actionLabel=app=>{if(app.health==="needs-content")return "Open development resource";if(app.type==="directory")return "Open directory";if(app.type==="tool")return "Open research tool";if(app.type==="quiz")return "Open learning tool";if(app.type==="compatibility")return "Open compatibility doorway";return "Open newsroom";};
const statusLabel=status=>status==="building"?"Still developing":"Public destination";

const NETWORK_CATEGORY_COPY=Object.freeze({
  gateway:"Public ecosystem gateway.",
  civic:"Civic and public-resource destination.",
  communication:"Communication and network destination.",
  education:"Learning and academic destination.",
  health:"Health and wellness destination.",
  creative:"Creative and cultural destination.",
  weather:"Weather and Earth-systems destination.",
  research:"Research and archive destination.",
  news:"News and verification destination.",
  environmental:"Environmental and stewardship destination.",
  games:"Games and interactive-learning destination.",
  professional:"Professional tools and resources.",
  finance:"Financial learning and resource destination.",
  diplomacy:"Diplomacy, culture, and public-learning destination."
});

const repositoryName=value=>String(value||"").split("/").filter(Boolean).pop()||"";
const siteInitials=title=>{
  const words=String(title||"").replace(/[^A-Za-z0-9 ]+/g," ").trim().split(/\s+/).filter(Boolean);
  if(!words.length)return "V";
  if(words.length===1)return words[0].slice(0,2).toUpperCase();
  return words.slice(0,2).map(word=>word[0]).join("").toUpperCase();
};
const isCanonicalTopLevelDestination=entry=>{
  const path=String(entry?.path||"").replace(/^\/+/, "");
  const type=String(entry?.type||"");
  return path.toLowerCase()==="index.html" ||
    (!path.includes("/") && ["gateway","network","archive","page","portal"].includes(type));
};
const siteFromRegistryEntry=entry=>{
  const maturity=String(entry.developmentStatus||"").toLowerCase();
  const building=["partial","landing-ready","blueprint","under-construction"].includes(maturity);
  return {
    title:String(entry.title||repositoryName(entry.repository)||"Public destination"),
    repo:repositoryName(entry.repository),
    url:String(entry.url||""),
    icon:siteInitials(entry.title),
    status:building?"building":"live",
    developmentStatus:maturity||"unspecified",
    description:String(entry.description||NETWORK_CATEGORY_COPY[entry.category]||"Approved Verve N Veda public destination.")
  };
};
async function loadCanonicalSites(){
  try{
    const response=await fetch(MASTER_DIRECTORY_URL,{cache:"no-store"});
    if(!response.ok)throw new Error("Directory request failed: "+response.status);
    const directory=await response.json();
    const approved=(Array.isArray(directory.entries)?directory.entries:[])
      .filter(entry=>
        entry?.directoryVisible===true &&
        entry?.status==="active" &&
        entry?.access==="free-public" &&
        /^https:/i.test(String(entry?.url||"")) &&
        isCanonicalTopLevelDestination(entry)
      );

    const byRepository=new Map();
    for(const entry of approved){
      const repo=repositoryName(entry.repository);
      if(!repo)continue;
      const existing=byRepository.get(repo);
      const rank=item=>{
        const path=String(item?.path||"").replace(/^\/+/, "").toLowerCase();
        if(path==="index.html")return 0;
        if(item?.type==="network")return 1;
        if(item?.type==="gateway")return 2;
        if(item?.type==="archive")return 3;
        if(item?.type==="page")return 4;
        return 5;
      };
      if(!existing||rank(entry)<rank(existing))byRepository.set(repo,entry);
    }

    SITES=[...byRepository.values()]
      .map(siteFromRegistryEntry)
      .sort((a,b)=>a.title.localeCompare(b.title));

    if(!SITES.length)throw new Error("Canonical directory returned no approved top-level destinations");
  }catch(error){
    console.warn("The Verifier could not load the canonical ecosystem directory.",error);
    SITES=[{
      title:"The Verifier",
      repo:CURRENT_SITE,
      url:location.href.split("#")[0],
      icon:"V",
      status:"live",
      developmentStatus:"fallback",
      description:"Current Verifier destination. Ecosystem directory temporarily unavailable."
    }];
  }
}


const SAFE_STORAGE=(()=>{
  try{
    const probe="__verifier_storage_probe__";
    localStorage.setItem(probe,"1");
    localStorage.removeItem(probe);
    return localStorage;
  }catch{
    return {getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
  }
})();

function loadFavorites(){
  try{
    const parsed=JSON.parse(SAFE_STORAGE.getItem(FAVORITES_KEY)||"[]");
    const validIds=new Set(APPS.map(app=>app.id));
    return new Set(Array.isArray(parsed)?parsed.filter(id=>validIds.has(id)):[]);
  }catch{
    SAFE_STORAGE.removeItem(FAVORITES_KEY);
    return new Set();
  }
}

let favorites=loadFavorites();
let favoritesOnly=false;
let lastFocusedElement=null;

function toast(message){
  const element=$("toast");
  if(!element)return;
  element.textContent=message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>element.classList.remove("show"),1800);
}

function updateClock(){
  const clock=$("localClock");
  if(clock)clock.textContent=new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"medium"}).format(new Date());
}

function orderedSites(){
  const anchorSet=new Set(NETWORK_ANCHORS);
  return [
    ...NETWORK_ANCHORS.map(repo=>SITES.find(site=>site.repo===repo)).filter(Boolean),
    ...SITES.filter(site=>!anchorSet.has(site.repo)).sort((a,b)=>a.title.localeCompare(b.title))
  ];
}

function syncCounts(){
  const open=APPS.filter(app=>app.health!=="needs-content").length;
  const newsroom=APPS.filter(app=>app.type==="newsroom").length;
  const tools=APPS.filter(app=>app.type==="tool"||app.type==="quiz").length;
  const directories=APPS.filter(app=>app.type==="directory").length;
  const compatibility=APPS.filter(app=>app.type==="compatibility").length;
  const buildingSites=SITES.filter(site=>site.status==="building").length;
  $("appStat").textContent=APPS.length;
  $("columnStat").textContent=COLUMNS.length;
  $("repositoryStat").textContent=SITES.length;
  $("manifestStatus").textContent=APPS.length+" resources · "+newsroom+" newsrooms · "+directories+" directories · "+tools+" tools"+(compatibility?" · "+compatibility+" compatibility doorway":"")+" · "+open+" open";
  $("repositoryManifestStatus").textContent=SITES.length+" active public destinations"+(buildingSites?" · "+buildingSites+" still developing":"");
}

function renderTrail(){
  $("networkTrail").innerHTML=orderedSites().map(site=>{
    const current=site.repo===CURRENT_SITE;
    const building=site.status==="building";
    return `<a class="trail-link ${current?"active":""} ${building?"building":""}" href="${escapeHTML(site.url)}" ${current?'aria-current="page"':'target="_blank" rel="noopener noreferrer"'} aria-label="${escapeHTML(site.title)}${building?", still developing":""}">${escapeHTML(site.title)}</a>`;
  }).join("");
}

function buildCategory(){
  $("categoryFilter").innerHTML=Object.entries(CATEGORIES).map(([key,value])=>`<option value="${escapeHTML(key)}">${escapeHTML(value.label)}</option>`).join("");
}

function renderApps(){
  const ordered=Object.keys(CATEGORIES).filter(key=>key!=="all");
  $("appGroups").innerHTML=ordered.map(category=>{
    const items=APPS.filter(app=>app.category===category);
    const columns=items.length===6?3:items.length===4?4:items.length===3?3:items.length===2?2:Math.min(items.length,4);return `<section class="app-group" data-group="${escapeHTML(category)}"><h3 class="group-heading">${escapeHTML(CATEGORIES[category].icon)} ${escapeHTML(CATEGORIES[category].label)}</h3><div class="app-grid app-grid-${columns}">${items.map(app=>{
      const health=app.health||"ready";
      return `<article class="card app-card ${escapeHTML(health)}" data-id="${escapeHTML(app.id)}" data-category="${escapeHTML(app.category)}" data-search="${escapeHTML((app.title+" "+app.description+" "+app.tags+" "+app.file+" "+categoryLabel(app.category)).toLowerCase())}">
        <div class="card-top"><span class="app-icon" aria-hidden="true">${escapeHTML(app.icon)}</span><button class="favorite" type="button" data-favorite="${escapeHTML(app.id)}" aria-label="${favorites.has(app.id)?"Remove":"Save"} ${escapeHTML(app.title)} ${favorites.has(app.id)?"from":"to"} saved resources" aria-pressed="${favorites.has(app.id)}">${favorites.has(app.id)?"♥":"♡"}</button></div>
        <span class="card-badge">${escapeHTML(app.badge)}</span>
        <span class="app-type">${escapeHTML(typeLabel(app.type))}</span>
        <span class="app-health ${escapeHTML(health)}">${escapeHTML(healthLabel(health))}</span>
        <h3>${formatTitle(app.title)}</h3>
        <p>${escapeHTML(app.description)}</p>
        <div class="card-actions"><a class="open ${health==="needs-content"?"development":""}" href="${appUrl(app)}" aria-label="${escapeHTML(actionLabel(app))}: ${escapeHTML(app.title)}">${escapeHTML(actionLabel(app))}</a></div>
      </article>`;
    }).join("")}</div></section>`;
  }).join("");

  document.querySelectorAll("[data-favorite]").forEach(button=>{
    button.addEventListener("click",()=>toggleFavorite(button.dataset.favorite,button));
  });
}

function toggleFavorite(id,button){
  favorites.has(id)?favorites.delete(id):favorites.add(id);
  SAFE_STORAGE.setItem(FAVORITES_KEY,JSON.stringify([...favorites]));
  const app=APPS.find(item=>item.id===id);
  const isSaved=favorites.has(id);
  button.textContent=isSaved?"♥":"♡";
  button.setAttribute("aria-pressed",String(isSaved));
  button.setAttribute("aria-label",`${isSaved?"Remove":"Save"} ${app?.title||"desk"} ${isSaved?"from":"to"} saved resources`);
  updateFavoriteCount();
  filterApps();
}

function updateFavoriteCount(){
  $("favoriteCount").textContent=favorites.size;
  $("favoritesButton").setAttribute("aria-pressed",String(favoritesOnly));
  $("favoritesButton").setAttribute("aria-label",favoritesOnly?"Show all Verifier resources":"Show saved resources only");
}

function filterApps(){
  const query=$("appSearch").value.trim().toLowerCase();
  const category=$("categoryFilter").value;
  let count=0;

  document.querySelectorAll(".app-card").forEach(card=>{
    const visible=(category==="all"||card.dataset.category===category)&&
      (!query||card.dataset.search.includes(query))&&
      (!favoritesOnly||favorites.has(card.dataset.id));
    card.hidden=!visible;
    if(visible)count++;
  });

  document.querySelectorAll(".app-group").forEach(group=>{
    group.hidden=![...group.querySelectorAll(".app-card")].some(card=>!card.hidden);
  });

  $("results").textContent=`${count} of ${APPS.length} Verifier resources shown${favoritesOnly?" · saved only":""}.`;
  $("empty").classList.toggle("show",count===0);
}

function randomApp(){
  let pool=APPS.filter(app=>app.health!=="needs-content"&&($("categoryFilter").value==="all"||app.category===$("categoryFilter").value));
  if(favoritesOnly)pool=pool.filter(app=>favorites.has(app.id));
  const app=pool[Math.floor(Math.random()*pool.length)];
  if(app)location.assign(appUrl(app));
  else toast("No open Verifier resources are available in that selection.");
}

function renderColumns(){
  $("columnGrid").innerHTML=COLUMNS.map(([title,file])=>{const meta=COLUMN_META[title]||{beat:"Editorial column",description:"Read the latest essays and commentary from this editorial desk."};return `<a class="category editorial-card" href="${columnUrl(file)}" aria-label="Open ${escapeHTML(title)} editorial column"><span class="editorial-beat">${escapeHTML(meta.beat)}</span><strong>${formatTitle(title)}</strong><span class="editorial-description">${escapeHTML(meta.description)}</span><span class="editorial-open">Read column →</span></a>`;}).join("");
}

function renderNetwork(){
  $("networkGrid").innerHTML=orderedSites().map(site=>{
    const current=site.repo===CURRENT_SITE;
    const building=site.status==="building";
    return `<a class="card site-card ${current?"current":""} ${building?"building":""}" href="${escapeHTML(site.url)}" ${current?'aria-current="page"':'target="_blank" rel="noopener noreferrer"'} aria-label="${escapeHTML(site.title)}${building?", landing page in development":""}">
      <span class="site-icon" aria-hidden="true">${escapeHTML(site.icon)}</span>
      <span class="site-status ${building?"building":"live"}">${escapeHTML(current?"Current site":statusLabel(site.status))}</span>
      <h3>${formatTitle(site.title)}</h3>
      <p>${escapeHTML(site.description)}</p>
      <span class="site-open">${current?"You are here":"Open destination"} →</span>
    </a>`;
  }).join("");
}

function buildDrawer(query=""){
  const q=query.trim().toLowerCase();
  const appMatches=APPS.filter(app=>!q||(app.title+" "+app.description+" "+app.tags+" "+app.file).toLowerCase().includes(q));
  const columnMatches=COLUMNS.filter(([title,file])=>!q||(title+" "+file).toLowerCase().includes(q));
  const sites=orderedSites();
  const siteMatches=sites.filter(site=>!q||(site.title+" "+site.description+" "+site.repo).toLowerCase().includes(q));
  const anchorMatches=siteMatches.filter(site=>NETWORK_ANCHORS.includes(site.repo));
  const networkMatches=siteMatches.filter(site=>!NETWORK_ANCHORS.includes(site.repo));

  const siteLink=site=>`<a class="menu-link" href="${escapeHTML(site.url)}" ${site.repo===CURRENT_SITE?'aria-current="page"':'target="_blank" rel="noopener noreferrer"'}><i aria-hidden="true">${escapeHTML(site.icon)}</i><span><strong>${escapeHTML(site.title)}</strong><small>${escapeHTML(site.status==="building"?"Still developing":site.description)}</small></span><span aria-hidden="true">↗</span></a>`;

  $("drawerContent").innerHTML=`
    <p class="menu-group">Network Anchors · ${anchorMatches.length}</p>
    <div class="menu-list">${anchorMatches.map(siteLink).join("")||"<small class='drawer-empty'>No network anchors matched.</small>"}</div>
    <p class="menu-group">Verifier Resources · ${appMatches.length}</p>
    <div class="menu-list">${appMatches.map(app=>`<a class="menu-link" href="${appUrl(app)}"><i aria-hidden="true">${escapeHTML(app.icon)}</i><span><strong>${escapeHTML(app.title)}</strong><small>${escapeHTML(typeLabel(app.type))} · ${escapeHTML(categoryLabel(app.category))}</small></span><span aria-hidden="true">→</span></a>`).join("")||"<small class='drawer-empty'>No newsroom desks matched.</small>"}</div>
    <p class="menu-group">Editorial Columns · ${columnMatches.length}</p>
    <div class="menu-list">${columnMatches.map(([title,file])=>`<a class="menu-link" href="${columnUrl(file)}"><i aria-hidden="true">§</i><span><strong>${escapeHTML(title)}</strong><small>Editorial column</small></span><span aria-hidden="true">→</span></a>`).join("")||"<small class='drawer-empty'>No columns matched.</small>"}</div>
    <p class="menu-group">Public Network · ${networkMatches.length}</p>
    <div class="menu-list">${networkMatches.map(siteLink).join("")||"<small class='drawer-empty'>No public destinations matched.</small>"}</div>`;
}

function setDrawerState(open){
  const overlay=$("drawer");
  overlay.classList.toggle("open",open);
  overlay.setAttribute("aria-hidden",String(!open));
  $("menuButton")?.setAttribute("aria-expanded",String(open));
  document.body.classList.toggle("drawer-open",open);
  if("inert" in overlay)overlay.inert=!open;
}

function openDrawer(){
  lastFocusedElement=document.activeElement;
  setDrawerState(true);
  setTimeout(()=>$("drawerSearch").focus(),80);
}

function closeDrawer({restoreFocus=true}={}){
  if(!$("drawer").classList.contains("open"))return;
  setDrawerState(false);
  if(restoreFocus&&lastFocusedElement instanceof HTMLElement)lastFocusedElement.focus();
}

function trapDrawerFocus(event){
  if(event.key!=="Tab"||!$("drawer").classList.contains("open"))return;
  const focusable=[...$("drawer").querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(element=>!element.hidden);
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
}

function auditManifest(){
  const issues=[];
  const duplicateValues=(items,key)=>[...new Set(items.map(item=>item[key]).filter((value,index,array)=>array.indexOf(value)!==index))];
  const appIds=duplicateValues(APPS,"id");
  const appFiles=duplicateValues(APPS,"file");
  const siteTitles=duplicateValues(SITES,"title");
  const siteUrls=duplicateValues(SITES,"url");
  if(!SITES.length)issues.push("Canonical ecosystem directory did not provide any public destinations.");
  const columnTitles=[...new Set(COLUMNS.map(item=>item[0]).filter((value,index,array)=>array.indexOf(value)!==index))];
  const columnFiles=[...new Set(COLUMNS.map(item=>item[1]).filter((value,index,array)=>array.indexOf(value)!==index))];

  if(appIds.length)issues.push(`Duplicate application IDs: ${appIds.join(", ")}`);
  if(appFiles.length)issues.push(`Duplicate application files: ${appFiles.join(", ")}`);
  if(siteTitles.length)issues.push(`Duplicate site titles: ${siteTitles.join(", ")}`);
  if(siteUrls.length)issues.push(`Duplicate site URLs: ${siteUrls.join(", ")}`);
  if(columnTitles.length)issues.push(`Duplicate column titles: ${columnTitles.join(", ")}`);
  if(columnFiles.length)issues.push(`Duplicate column files: ${columnFiles.join(", ")}`);

  APPS.forEach(app=>{
    if(!CATEGORIES[app.category])issues.push(`Unknown category for ${app.title}: ${app.category}`);
    if(!/^[\w .&'™-]+\.html$/u.test(app.file))issues.push(`Unusual application filename: ${app.file}`);
  });
  COLUMNS.forEach(([title,file])=>{
    if(!/^[\w .&'™-]+\.html$/u.test(file))issues.push(`Unusual column filename: ${title} → ${file}`);
  });
  SITES.forEach(site=>{
    try{
      const parsed=new URL(site.url);
      if(parsed.protocol!=="https:")issues.push(`Non-HTTPS site URL: ${site.title}`);
    }catch{
      issues.push(`Invalid site URL: ${site.title}`);
    }
  });
  REQUIRED_IDS.forEach(id=>{if(!$(id))issues.push(`Missing required element #${id}`);});

  if(issues.length)console.warn("The Verifier audit found issues:",issues);
  else console.info(`The Verifier audit passed: ${APPS.length} applications, ${COLUMNS.length} columns, ${SITES.length} public destinations.`);
  return issues;
}

async function initialize(){
  
  updateClock();
  setInterval(updateClock,1000);
  await loadNewsroomDirectory();
  await loadEditorialColumns();
  await loadCanonicalSites();
  syncCounts();
  renderTrail();
  buildCategory();
  renderApps();
  renderColumns();
  renderNetwork();
  buildDrawer();
  updateFavoriteCount();
  filterApps();
  setDrawerState(false);
  auditManifest();

  $("appSearch").addEventListener("input",filterApps);
  $("categoryFilter").addEventListener("change",filterApps);
  $("favoritesButton").addEventListener("click",()=>{
    favoritesOnly=!favoritesOnly;
    updateFavoriteCount();
    filterApps();
  });
  $("randomButton").addEventListener("click",randomApp);
  $("menuButton")?.addEventListener("click",openDrawer);
document.addEventListener("click",event=>{
  const link=event.target.closest?.('a[href="#verifier-directory"]');
  if(!link)return;
  event.preventDefault();
  openDrawer();
});
  $("drawerClose").addEventListener("click",()=>closeDrawer());
  $("drawer").addEventListener("click",event=>{
    if(event.target===$("drawer"))closeDrawer();
    if(event.target.closest(".menu-link"))closeDrawer({restoreFocus:false});
  });
  $("drawerSearch").addEventListener("input",event=>buildDrawer(event.target.value));
  $("topButton").addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape")closeDrawer();
    if(event.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){
      event.preventDefault();
      $("appSearch").focus();
    }
    trapDrawerFocus(event);
  });
}

initialize();
