"""Validate dated result snapshot and separation of cumulative and match points."""
import copy,json
from pathlib import Path
from render_league_results import render
HERE=Path(__file__).resolve().parent

def main():
 d=json.loads((HERE/'data/league-results-4th.json').read_text());p=json.loads((HERE/'pages/league-results-4th.json').read_text());assert render(d)==p
 assert d['as_of']=='2026-11-04' and [x['team_pt'] for x in d['red']]==[2786,1277,239,-3000]
 assert [x['player_avg_pt'] for x in d['players']]==[1786,518,239,-2500]
 assert [x['player_total_pt'] for x in d['players']]==[1786,518,239,-2500]
 assert all(x['rank']==1 and x['team_pt']==0 for x in d['blue'])
 assert [x['team_pt'] for x in d['battle_red1']]==[2786,1277,239,-3000]
 changed=copy.deepcopy(d);changed['red'][0]['team_pt']=123;out=render(changed)['body'];battle=out.split('id="battle"')[1].split('</section>')[0];assert '+2,786pt' in battle and '+123pt' not in battle
 assert 'ネタバレ' in p['body'] and '自動更新ではありません' in p['body'] and '画像外' in p['body']
 print('PASS: dated source, score categories, snapshot provenance and independent match history')
if __name__=='__main__':main()
