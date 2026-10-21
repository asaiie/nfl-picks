// One-time import of saved ESPN regular-season feeds. Never overwrites existing games.
import {readFile,writeFile} from 'node:fs/promises';
import {TEAMS,easternDay} from '../shared.js';
const records=[],seen=new Set(),counts={};
for(let week=7;week<=18;week++){
 const data=JSON.parse(await readFile(new URL(`../data/week-${week}.json`,import.meta.url),'utf8'));
 if(data.season?.year!==2026||data.season?.type!==2||data.week?.number!==week||!data.events?.length)throw Error('Invalid feed for week '+week);
 const weekly=new Set();
 for(const e of data.events){
  const c=e.competitions?.[0];const code=v=>v==='WSH'?'WAS':v;
  const home=code(c?.competitors?.find(t=>t.homeAway==='home')?.team?.abbreviation),away=code(c?.competitors?.find(t=>t.homeAway==='away')?.team?.abbreviation);
  const tipoff=Date.parse(e.date),id=String(e.id),tbd=c?.timeValid===false||c?.status?.isTBDFlex===true||e.status?.type?.name==='STATUS_SCHEDULED_TBD';
  if(!/^\d+$/.test(id)||seen.has(id)||weekly.has(home)||weekly.has(away)||home===away||!TEAMS.includes(home)||!TEAMS.includes(away)||!Number.isFinite(tipoff)||e.season?.year!==2026||e.season?.type!==2||e.week?.number!==week)throw Error('Invalid game '+id);
  seen.add(id);weekly.add(home);weekly.add(away);
  records.push({id,week,home,away,tipoff,day:easternDay(tipoff),time_tbd:Number(tbd)});
 }
 counts[week]=data.events.length;
}
const quote=v=>typeof v==='number'?String(v):"'"+String(v).replaceAll("'","''")+"'";
await writeFile(new URL('../migrations/0002_schedule.sql',import.meta.url),`-- ESPN 2026 regular season. Imported ${new Date().toISOString()}.\n-- ${records.length} games; Weeks 7–18. Re-running preserves results, kickoff edits and picks.\n`+records.map(g=>'INSERT OR IGNORE INTO games(id,week,home,away,tipoff,day,time_tbd) VALUES('+Object.values(g).map(quote).join(',')+');').join('\n')+'\n');
console.log(JSON.stringify({games:records.length,weeks:counts,tbd:records.filter(g=>g.time_tbd).length}));
