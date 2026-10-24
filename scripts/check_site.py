"""Comprobación estática sin dependencias: python scripts/check_site.py."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json

ROOT = Path(__file__).resolve().parents[1]


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []
        self.headings = 0
        self.description = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"ID duplicado: {attrs['id']}"
            self.ids.add(attrs['id'])
        self.headings += tag == 'h1'
        if tag == 'meta' and attrs.get('name') == 'description':
            self.description = bool(attrs.get('content'))
        if tag == 'img' and attrs.get('id') != 'modal-image':
            assert attrs.get('alt'), 'Imagen sin texto alternativo'
        for key in ('src', 'href'):
            if key in attrs:
                self.links.append(attrs[key])


parser = SiteParser()
parser.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
assert parser.headings == 1, 'Debe existir un único h1'
assert parser.description, 'Falta la descripción SEO'
for link in parser.links:
    url = urlsplit(link)
    if url.scheme or url.netloc:
        continue
    if url.path:
        assert (ROOT / unquote(url.path)).is_file(), f'Recurso inexistente: {link}'
    if url.fragment and not url.path:
        assert url.fragment in parser.ids, f'Ancla inexistente: {link}'
html = (ROOT / 'index.html').read_text(encoding='utf-8')
structured_data = html.split('<script type="application/ld+json">')[1].split('</script>')[0]
json.loads(structured_data)
assert '<form' not in html, 'El formulario está pendiente de activación'
print('OK: anclas, recursos, imágenes, título principal, descripción y JSON-LD.')
