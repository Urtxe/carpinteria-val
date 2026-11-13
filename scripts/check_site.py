"""Comprobación estática sin dependencias: python scripts/check_site.py."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import xml.etree.ElementTree as ET

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
            if 'srcset' in attrs:
                assert attrs.get('sizes'), 'Imagen adaptable sin sizes'
                self.links.extend(candidate.strip().split()[0]
                                  for candidate in attrs['srcset'].split(','))
        if tag == 'form':
            assert ('hidden' in attrs
                    and attrs.get('action') == 'https://api.web3forms.com/submit'
                    and attrs.get('method') == 'POST'), (
                'El formulario debe esperar a JavaScript y enviar a Web3Forms por POST'
            )
        for key in ('src', 'href'):
            if key in attrs:
                self.links.append(attrs[key])


html_files = sorted(ROOT.glob('*.html'))
assert html_files, 'No hay páginas HTML para publicar'
parsers = {}

for html_file in html_files:
    parser = SiteParser()
    html = html_file.read_text(encoding='utf-8')
    parser.feed(html)
    assert parser.headings == 1, f'{html_file.name}: debe existir un único h1'
    assert parser.description, f'{html_file.name}: falta la descripción SEO'
    if html_file.name == 'index.html':
        structured_data = html.split('<script type="application/ld+json">')[1].split('</script>')[0]
        json.loads(structured_data)
    parsers[html_file.name] = parser

for html_file, parser in parsers.items():
    for link in parser.links:
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        target = None
        if url.path:
            path = unquote(url.path).lstrip('/')
            target = ROOT / (path or 'index.html')
            assert target.is_file(), f'{html_file}: recurso inexistente: {link}'
        if url.fragment:
            target_name = target.name if target else html_file
            assert url.fragment in parsers[target_name].ids, (
                f'{html_file}: ancla inexistente: {link}'
            )

namespace = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap = ET.parse(ROOT / 'sitemap.xml')
sitemap_urls = {
    node.text for node in sitemap.findall('.//s:loc', namespace)
}
for html_file in html_files:
    path = '/' if html_file.name == 'index.html' else f'/{html_file.name}'
    expected_url = f'https://alejandrovalcarpinteria.es{path}'
    assert expected_url in sitemap_urls, f'Falta {expected_url} en sitemap.xml'

print('OK: páginas, anclas, recursos, imágenes, SEO, sitemap y JSON-LD.')
