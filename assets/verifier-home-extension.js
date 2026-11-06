/* The Verifier · homepage editorial extension · v3.0.0
   Presentation-only enhancements. Newsroom inventory and metadata are owned
   exclusively by data/verifier-newsroom-directory.json. */
(() => {
  "use strict";

  const EDITION_URL="./data/generated/latest.json";
  let editionPromise=null;

  function loadEdition(){
    if(!editionPromise){
      editionPromise=fetch(EDITION_URL,{cache:"no-store"}).then(response=>{
        if(!response.ok)throw new Error("Edition temporarily unavailable");
        return response.json();
      });
    }
    return editionPromise;
  }

  function showFeedHealth() {
    const actions = document.querySelector(".hero .actions");
    if (!actions || document.querySelector("[data-verifier-feed-health]")) return;
    const status = document.createElement("p");
    status.dataset.verifierFeedHealth = "true";
    status.setAttribute("role", "status");
    status.style.cssText = "font-size:16px;line-height:1.5;margin:12px auto;color:inherit;max-width:60ch";
    status.textContent = "Checking the latest published news edition…";
    actions.insertAdjacentElement("afterend", status);

    loadEdition()
      .then(data => {
        const stamp = Date.parse(data.generatedAt || "");
        const age = Date.now() - stamp;
        const valid = Number.isFinite(stamp) && age >= -300000;
        const healthy = Number(data.feedSourcesSuccessful || 0);
        const total = Number(data.feedSourcesConfigured || 0);
        if (!valid) {
          status.textContent = "Edition timestamp unavailable. Please check original publisher dates.";
          return;
        }
        const when = new Date(stamp).toLocaleString();
        const freshness = age > 30 * 60 * 60 * 1000 ? "Archived edition — updates may be delayed" : "Latest published edition";
        const coverage = total ? ` · Sources available: ${healthy}/${total}` : "";
        status.textContent = `${freshness} · Updated ${when}${coverage}. Headlines are publisher discoveries, not independently verified findings.`;
      })
      .catch(() => {
        status.textContent = "Live edition status unavailable. News links and research tools remain accessible.";
      });
  }

  function storyDate(story){
    const raw=Number(story?.pubMs||Date.parse(story?.pubDate||""));
    return Number.isFinite(raw)?raw:0;
  }

  function selectBriefingStories(stories){
    const now=Date.now()+5*60*1000;
    const sorted=(Array.isArray(stories)?stories:[])
      .filter(story=>story?.title&&story?.link&&storyDate(story)>0&&storyDate(story)<=now)
      .sort((a,b)=>storyDate(b)-storyDate(a));
    const selected=[],sources=new Set();
    for(const story of sorted){
      const source=String(story.source||story.sourceId||"Unknown");
      if(sources.has(source))continue;
      sources.add(source);
      selected.push(story);
      if(selected.length===4)break;
    }
    if(selected.length<4){
      for(const story of sorted){
        if(selected.includes(story))continue;
        selected.push(story);
        if(selected.length===4)break;
      }
    }
    return selected;
  }

  function renderBriefing(){
    const grid=document.getElementById("briefingGrid");
    if(!grid)return;
    loadEdition()
      .then(data=>{
        const stories=selectBriefingStories(data.stories);
        grid.replaceChildren();
        if(!stories.length){
          const empty=document.createElement("article");
          empty.className="briefing-placeholder";
          empty.textContent="No current briefing stories are available right now.";
          grid.append(empty);
          return;
        }
        stories.forEach(story=>{
          const article=document.createElement("article");
          article.className="briefing-card";

          const source=document.createElement("span");
          source.className="briefing-source";
          source.textContent=story.source||"Publisher source";

          const title=document.createElement("h3");
          title.textContent=story.title;

          const desc=document.createElement("p");
          desc.textContent=story.description||"Open the original publisher for the full report.";

          const meta=document.createElement("div");
          meta.className="briefing-meta";
          const parts=[];
          if(story.region)parts.push(story.region);
          const ms=storyDate(story);
          if(ms)parts.push(new Date(ms).toLocaleString([], {month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}));
          meta.textContent=parts.join(" · ");

          const link=document.createElement("a");
          link.href=story.link;
          link.target="_blank";
          link.rel="noopener noreferrer";
          link.textContent="Open original source →";

          article.append(source,title,desc,meta,link);
          grid.append(article);
        });
      })
      .catch(()=>{
        grid.replaceChildren();
        const empty=document.createElement("article");
        empty.className="briefing-placeholder";
        empty.textContent="Today’s briefing is temporarily unavailable. The newsroom desks remain available below.";
        grid.append(empty);
      });
  }

  function addDailyTop30Shortcut() {
    const actions = document.querySelector(".hero .actions");
    if (!actions || actions.querySelector("[data-verifier-daily-top30]")) return;
    const link = document.createElement("a");
    link.href = "apps/daily_digest_index.html";
    link.className = "btn primary";
    link.textContent = "Open Daily Top 30";
    link.setAttribute("data-verifier-daily-top30", "true");
    actions.prepend(link);
  }

  function apply() {
    try {
      showFeedHealth();
      renderBriefing();
      addDailyTop30Shortcut();
    } catch (error) {
      console.warn("Verifier homepage editorial extension could not apply", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, {once:true});
  else apply();
})();
