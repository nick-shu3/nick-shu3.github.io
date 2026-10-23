import copy,importlib.util,json,pathlib,tempfile,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('election_build',ROOT/'scripts/election-tankyu/build.py');b=importlib.util.module_from_spec(spec);spec.loader.exec_module(b)
class CatalogTests(unittest.TestCase):
 def setUp(self):self.d=json.loads(b.CANONICAL.read_text())
 def test_catalog(self):b.validate(self.d)
 def test_baseline_preserved(self):
  for i in range(1,6):self.assertTrue(next(p for p in self.d['promises'] if p['id']==f'P{i:03}')['summary'])
 def test_generated_files_current(self):b.build(check=True)
 def test_update_reaches_html_and_json(self):
  self.d['promises'][0]['summary']='Synthetic changed public promise summary'
  with tempfile.TemporaryDirectory() as tmp:
   p=pathlib.Path(tmp)/'input.json';p.write_text(json.dumps(self.d));out=pathlib.Path(tmp)/'out';b.build(p,out)
   self.assertIn('Synthetic changed public promise summary',(out/'index.html').read_text());self.assertIn('Synthetic changed public promise summary',(out/'data.json').read_text())
 def test_escape_untrusted_text(self):
  self.d['promises'][0]['summary']='<img src=x onerror=alert(1)>'
  text,_=b.render(self.d);self.assertIn('&lt;img',text);self.assertNotIn('<img src=x',text)
 def test_duplicate_id(self):
  self.d['promises'].append(copy.deepcopy(self.d['promises'][0]));self.assertRaises(AssertionError,b.validate,self.d)
 def test_missing_source(self):
  self.d['promises'][0]['source_ids']=['MISSING'];self.assertRaises(AssertionError,b.validate,self.d)
 def test_unapproved_event_rejected(self):
  self.d['promises'][0]['events']=[{'body':'SYNTHETIC_UNAPPROVED_CLAIM'}];self.assertRaises(AssertionError,b.render,self.d)
 def test_unapproved_involvement_rejected(self):
  self.d['promises'][0]['involvements']=[{'action':'SYNTHETIC_UNAPPROVED_INVOLVEMENT'}];self.assertRaises(AssertionError,b.render,self.d)
 def test_unapproved_status_rejected(self):
  self.d['promises'][0]['assessment']['fulfillment']='実現';self.assertRaises(AssertionError,b.validate,self.d)
 def test_unapproved_actual_rejected(self):
  self.d['promises'][0]['metrics']={'actual':{'value':6}};self.assertRaises(AssertionError,b.validate,self.d)
 def test_boolean_not_human_approval(self):
  self.d['promises'][0]['assessment_approved']=True;self.assertRaises(AssertionError,b.validate,self.d)
 def test_original_approval_separate(self):
  p=self.d['promises'][0];p['original_human_approved']=True;s={s['id']:s for s in self.d['sources']}
  self.d['public_approvals']=[dict(entity_type='original',entity_id=p['id'],actor_type='human',decision='approved',content_sha256=b.fingerprint(p,'original',s))]
  b.validate(self.d);p['assessment_approved']=True;self.assertRaises(AssertionError,b.validate,self.d)
 def test_stale_approval_rejected(self):
  p=self.d['promises'][0];p['original_human_approved']=True;s={s['id']:s for s in self.d['sources']}
  self.d['public_approvals']=[dict(entity_type='original',entity_id=p['id'],actor_type='human',decision='approved',content_sha256=b.fingerprint(p,'original',s))];p['summary']+=' changed';self.assertRaises(AssertionError,b.validate,self.d)
 def test_no_private_data(self):
  self.d['reviewer_id']='synthetic';self.assertRaises(AssertionError,b.validate,self.d)
 def test_unlisted_host(self):
  self.d['sources'][0]['url']='https://example.invalid/';self.assertRaises(AssertionError,b.validate,self.d)
 def test_https_required(self):
  self.d['sources'][0]['url']='http://www.jimin.jp/';self.assertRaises(AssertionError,b.validate,self.d)
 def test_no_invented_actuals(self):
  for p in self.d['promises']:self.assertFalse(b.compare_metric(p.get('metrics'))['eligible'])
 def metric(self):
  a=dict(value=100,unit='円',entity='個人',period='年',calendar='年度',price_basis='名目',population='対象集団A',region='日本',revision='確報',direction='increase');c=copy.deepcopy(a);c['value']=60;return dict(target=a,actual=c)
 def test_comparable(self):
  r=b.compare_metric(self.metric());self.assertTrue(r['eligible']);self.assertEqual(r['difference'],-40);self.assertEqual(r['ratio'],.6)
 def test_each_dimension_mismatch(self):
  for key in b.DIMENSIONS:
   with self.subTest(key=key):
    m=self.metric();m['actual'][key]='different';self.assertFalse(b.compare_metric(m)['eligible'])
 def test_unknown_dimensions(self):
  m=self.metric();m['target']['calendar']=m['actual']['calendar']='未指定';self.assertFalse(b.compare_metric(m)['eligible'])
 def test_zero_target(self):
  m=self.metric();m['target']['value']=0;self.assertIsNone(b.compare_metric(m)['ratio'])
 def test_decrease_not_raw_ratio(self):
  m=self.metric();m['target']['direction']=m['actual']['direction']='decrease';r=b.compare_metric(m);self.assertTrue(r['threshold_met']);self.assertIsNone(r['ratio'])
 def test_invalid_numeric(self):
  for v in [True,-1,float('nan'),float('inf'),'60']:
   m=self.metric();m['actual']['value']=v;self.assertFalse(b.compare_metric(m)['eligible'])
if __name__=='__main__':unittest.main(verbosity=2)
