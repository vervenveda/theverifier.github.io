// Dependency-free behavior checks for the browser's published-edition adapter.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const code=fs.readFileSync('assets/verifier-news-data.js','utf8');
function client({age=0,fail=false}={}){
  const requests=[];
  const data={schemaVersion:1,generatedAt:new Date(Date.now()-age).toISOString(),stories:[
    {id:'one',title:'Real headline',link:'https://publisher.example/story',sourceId:'publisher',source:'Publisher',sourceHomepage:'https://publisher.example/',languages:['English'],topics:['Science']},
    {title:'Unsafe link',link:'javascript:alert(1)',sourceId:'publisher'}
  ]};
  const context={window:{},URL,AbortController,setTimeout,clearTimeout,fetch:async url=>{
    requests.push(url);if(fail)throw Error('Offline');
    return {ok:true,json:async()=>url.includes('sources.json')?{schemaVersion:1,sources:[{id:'publisher',name:'Publisher',homepage:'https://publisher.example/',feed:'https://publisher.example/feed'}]}:data};
  }};vm.runInNewContext(code,context);return {api:context.window.VerifierNewsData,requests};
}
test('daily publication is current at 24 hours and stale after 30 hours',async()=>{
 assert.equal((await client({age:24*3600000}).api.loadLatest()).mode,'first-party');
 assert.equal((await client({age:31*3600000}).api.loadLatest()).mode,'first-party-stale');
});
test('source reader shares requests, filters unsafe links, and refreshes on reset',async()=>{
 const {api,requests}=client(),reader=api.createSourceReader(),source={url:'https://publisher.example/feed'};
 const [a,b]=await Promise.all([reader.read(source),reader.read(source)]);
 assert.equal(a.stories.length,1);assert.equal(b.stories[0].source,'Publisher');assert.equal(requests.length,2);
 reader.reset();await reader.read(source);assert.equal(requests.length,4);
 await assert.rejects(reader.read({url:'https://unknown.example/feed'}),/not configured/);
});
test('vintage adapter preserves real headline and article URL, respects outlet selection',async()=>{
 const {api}=client();const a=await api.vintageArticles([{id:'publisher'}]);assert.equal(a.length,1);
 assert.equal(a[0].url,'https://publisher.example/story');assert.equal(a[0].title,'Real headline');
 assert.equal((await api.vintageArticles([{id:'different'}])).length,0);
});
test('offline failure is exposed for application cache fallback',async()=>{
 await assert.rejects(client({fail:true}).api.createSourceReader().read({url:'https://publisher.example/feed'}),/Offline/);
});

test('future event dates never receive publication freshness credit',()=>{
 const {api}=client();
 const future=new Date(Date.now()+12*86400000).toISOString();
 const entry=api.normalizeStory({title:'Scheduled event',link:'https://publisher.example/event',pubDate:future,pubMs:Date.parse(future)});
 assert.equal(entry.publicationDateStatus,'future-or-event-date');
 assert.equal(entry.pubMs,0);
 assert.equal(entry.pubDate,future);
});
test('missing dates remain unranked rather than being treated as today',()=>{
 const {api}=client();
 const entry=api.normalizeStory({title:'Undated',link:'https://publisher.example/undated'});
 assert.equal(entry.publicationDateStatus,'unknown');
 assert.equal(entry.pubMs,0);
 assert.equal(entry.verificationStatus,'discovered');
});
test('valid past publication dates remain sortable and unverified',()=>{
 const {api}=client(),pubDate='2026-10-01T12:00:00Z';
 const entry=api.normalizeStory({title:'Dated story',link:'https://publisher.example/dated',pubDate});
 assert.equal(entry.publicationDateStatus,'dated');
 assert.equal(entry.pubMs,Date.parse(pubDate));
 assert.equal(entry.verificationStatus,'discovered');
});
