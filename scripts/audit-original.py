import json, hashlib, urllib.request, re
from pathlib import Path
from html.parser import HTMLParser

root = Path(__file__).resolve().parent.parent
out = root / '.audit' / 'original'
out.mkdir(parents=True, exist_ok=True)
urls = set()
class Assets(HTMLParser):
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'script' or (tag == 'link' and a.get('rel') in ('stylesheet', 'modulepreload')):
            u = a.get('src') or a.get('href') or ''
            if u.startswith('/assets/'):
                urls.add('https://naroradar.com' + u)
for p in (root / 'docs' / 'evidence').glob('original-*-rea.json'):
    e = json.loads(p.read_text(encoding='utf-8'))
    Assets().feed(e['normalized_result']['steps'][-1]['artifacts']['dom']['value']['text'])
manifest = []
visited = set()
while urls - visited:
    u = sorted(urls - visited)[0]
    visited.add(u)
    target = out / u.rsplit('/', 1)[-1]
    if not target.exists():
        req = urllib.request.Request(u, headers={'User-Agent':'Mozilla/5.0'})
        target.write_bytes(urllib.request.urlopen(req, timeout=30).read())
    data = target.read_bytes()
    manifest.append({'url':u,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data)})
    if u.endswith('.js'):
        source = data.decode('utf-8')
        for name in re.findall(r'assets/[^\s\x22\x27`]+?\.(?:js|css)', source):
            urls.add('https://naroradar.com/' + name)
        for name in re.findall(r'(?:from|import\()\s*[\x22\x27]\./([^\x22\x27]+\.js)', source):
            urls.add('https://naroradar.com/assets/' + name)
(out/'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(json.dumps(manifest, indent=2))
