"""Recover the requested original brand assets from retained public evidence."""
from pathlib import Path
import json,re,urllib.request,hashlib,base64
root=Path(__file__).resolve().parent.parent
out=root/'frontend/public/brand'
out.mkdir(parents=True,exist_ok=True)
manifest=[]
for name in ['logo.png','logo-dark.png','logo-uxuy.png','logo-radar-dao.png','logo-radar-dao-en.png','partners-uxuy-radar.png']:
    url='https://naroradar.com/naro-assets/'+name
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    data=urllib.request.urlopen(req,timeout=30).read()
    (out/name).write_bytes(data)
    manifest.append({'source':url,'file':'/brand/'+name,'sha256':hashlib.sha256(data).hexdigest()})
e=json.loads((root/'docs/evidence/original-home-rea.json').read_text(encoding='utf-8'))
dom=e['normalized_result']['steps'][-1]['artifacts']['dom']['value']['text']
svg=re.search(r'<svg[^>]*class="nr nr2d"[\s\S]*?</svg>',dom).group()
svg=re.sub(r' data-v-[\w-]+(?:="[^"]*")?','',svg)
svg=svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" ',1)
svg=svg.replace('width="150" height="172"','width="200" height="230"')
svg=svg.replace('href="/naro-assets/logo-dark.png"','href="data:image/png;base64,'+base64.b64encode((out/'logo-dark.png').read_bytes()).decode()+'"')
svg=svg.replace('<defs>','<style>.acc{display:none}</style><defs>',1)
(out/'naro-mascot.svg').write_text(svg,encoding='utf-8')
manifest.append({'source':'https://naroradar.com/assets/HomeView-wu8vOjqN.js','evidence':e['evidence_id'],'file':'/brand/naro-mascot.svg','notes':'Original SVG geometry; Vue scope attributes removed, hidden accessories preserved, chest logo embedded.'})
(root/'docs/evidence/brand-provenance.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print('Recovered',len(manifest),'original brand assets')
