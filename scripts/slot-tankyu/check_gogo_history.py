"""Validate reconciled bonus data and reject inconsistent edited histories."""
import copy,hashlib,json
from gogo_history import DATA,bonus_history

def check_gogo():
    assert hashlib.sha256(DATA.read_bytes()).hexdigest()=='e88c9c7786f68d87c15023d28cbad6dcbc09d081a4e1e509f73101a60d419e32'
    data=json.loads(DATA.read_text());body=bonus_history(data)
    assert body.count('<tr>')==63 and body.count('回目</th>')==62
    assert data['events'][32]['game']==34 and data['events'][32]['trigger'] is None
    assert data['events'][25]['game']==213 and data['events'][26]['game']==147
    assert data['events'][45]['game']==550
    assert sum(x['game'] for x in data['events'])==7797
    assert sum(x['coins']==97 for x in data['events'])==2
    for case in ['missing','duplicate','reverse','negative','kind','coins']:
        bad=copy.deepcopy(data)
        if case=='missing':bad['events'].pop()
        elif case=='duplicate':bad['events'][1]['number']=1
        elif case=='reverse':bad['events'][1]['time']='09:00'
        elif case=='negative':bad['events'][0]['game']=-1
        elif case=='kind':bad['events'][0]['kind']='AT'
        else:bad['events'][0]['coins']=240
        try:bonus_history(bad)
        except ValueError:pass
        else:raise AssertionError('Invalid history accepted: '+case)
    bad=copy.deepcopy(data);bad['events'][0]['trigger']='<script>untrusted</script>'
    assert '&lt;script&gt;' in bonus_history(bad) and '<script>untrusted' not in bonus_history(bad)
    print('PASS: 62 bonuses, corrected games, unknown trigger retained, invalid histories rejected, text escaped')

if __name__=='__main__':check_gogo()
