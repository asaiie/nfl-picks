export const PEOPLE = ['Amit', 'Supreet', 'Nikhil', 'Shahzad', 'Kartik'];
export const AFC = ['BAL','BUF','CIN','CLE','DEN','HOU','IND','JAX','KC','LAC','LV','MIA','NE','NYJ','PIT','TEN'];
export const NFC = ['ARI','ATL','CAR','CHI','DAL','DET','GB','LAR','MIN','NO','NYG','PHI','SEA','SF','TB','WAS'];
export const TEAMS = [...AFC,...NFC].sort();
export const CATEGORIES = { afc_champ:'AFC champion', nfc_champ:'NFC champion', champ:'Super Bowl champion' };
export const NAMES = {ARI:'Arizona Cardinals',ATL:'Atlanta Falcons',BAL:'Baltimore Ravens',BUF:'Buffalo Bills',CAR:'Carolina Panthers',CHI:'Chicago Bears',CIN:'Cincinnati Bengals',CLE:'Cleveland Browns',DAL:'Dallas Cowboys',DEN:'Denver Broncos',DET:'Detroit Lions',GB:'Green Bay Packers',HOU:'Houston Texans',IND:'Indianapolis Colts',JAX:'Jacksonville Jaguars',KC:'Kansas City Chiefs',LAC:'Los Angeles Chargers',LAR:'Los Angeles Rams',LV:'Las Vegas Raiders',MIA:'Miami Dolphins',MIN:'Minnesota Vikings',NE:'New England Patriots',NO:'New Orleans Saints',NYG:'New York Giants',NYJ:'New York Jets',PHI:'Philadelphia Eagles',PIT:'Pittsburgh Steelers',SEA:'Seattle Seahawks',SF:'San Francisco 49ers',TB:'Tampa Bay Buccaneers',TEN:'Tennessee Titans',WAS:'Washington Commanders'};
export const teamsFor = category => category==='afc_champ'?AFC:category==='nfc_champ'?NFC:category==='champ'?TEAMS:[];
export const validPrediction = (category,value) => Object.hasOwn(CATEGORIES,category) && typeof value==='string' && (value==='' || teamsFor(category).includes(value));
export const easternDay = (ms=Date.now()) => new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(ms);
export const canPick = (g, now=Date.now()) => g.week>=7 && g.status==='scheduled' && !g.locked && !g.time_tbd && g.tipoff>now;
export function pickResult(g,pick) {
 if(g.status!=='final') return null;
 if(g.winner==='TIE') return 'tie';
 return pick?.team===g.winner?'correct':pick?'incorrect':'missing';
}
export function standings(users,games,picks) {
 const finals=games.filter(g=>g.week>=7 && g.week<=18 && g.status==='final' && g.winner!=='TIE');
 const index=new Map(picks.map(p=>[`${p.user_id}:${p.game_id}`,p]));
 return users.map(u=>{
  let correct=0,missed=0;
  for(const g of finals){const p=index.get(`${u.id}:${g.id}`);if(!p)missed++;else if(p.team===g.winner)correct++;}
  return {...u,correct,missed,total:finals.length,incorrect:finals.length-correct,accuracy:finals.length?correct/finals.length:null};
 }).sort((a,b)=>b.correct-a.correct||a.id-b.id);
}
