"""Extract user-owned workbook figures, exact text and page facsimiles. No external assets."""
from zipfile import ZipFile
from lxml import etree as E
from pathlib import Path
from PIL import Image
import io,json,re,hashlib,fitz
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--docx',required=True);parser.add_argument('--pdf',required=True);args=parser.parse_args()
source=Path(args.docx)
out=Path('dist/simulators/csl-8/book');out.mkdir(parents=True,exist_ok=True)
z=ZipFile(source);r=E.fromstring(z.read('word/document.xml'))
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships','pic':'http://schemas.openxmlformats.org/drawingml/2006/picture'}
rels={x.get('Id'):x.get('Target') for x in E.fromstring(z.read('word/_rels/document.xml.rels'))}
def text(b):return ' '.join(b.xpath('.//w:t/text()',namespaces=ns)).strip()
def image(blip):
 rid=blip.get('{'+ns['r']+'}embed');target=rels[rid];data=z.read('word/'+target);im=Image.open(io.BytesIO(data)).convert('RGB')
 fill=blip.getparent();crop=fill.find('a:srcRect',ns);v={k:int(crop.get(k,'0')) for k in ['l','t','r','b']} if crop is not None else dict.fromkeys(['l','t','r','b'],0)
 if any(v.values()):im=im.crop((im.width*v['l']/1e5,im.height*v['t']/1e5,im.width*(1-v['r']/1e5),im.height*(1-v['b']/1e5)))
 key=hashlib.sha256(data+str(v).encode()).hexdigest()[:16];name='figure-'+key+'.webp';im.thumbnail((1600,1200));im.save(out/name,'WEBP',quality=92)
 return 'book/'+name
def block(b):
 if b.tag.endswith('}tbl'):
  return {'kind':'table','rows':[[{'text':text(c),'images':[image(x) for x in c.xpath('.//a:blip',namespaces=ns)]} for c in row.findall('w:tc',ns)] for row in b.findall('w:tr',ns)]}
 return {'kind':'paragraph','text':text(b),'images':[image(x) for x in b.xpath('.//a:blip',namespaces=ns)]}
pages=[];buf=[]
for b in r.find('w:body',ns):
 if b.xpath('.//w:br[@w:type="page"]',namespaces=ns):pages.append(buf);buf=[]
 if text(b) or b.xpath('.//a:blip',namespaces=ns):buf.append(block(b))
pages.append(buf)

life_indices=[(12,15),(16,20),(21,26),(27,32),(33,38),(39,45),(46,53),(54,61),(62,69),(70,77)]
service_indices=[(83,88),(89,95),(96,101),(102,107),(108,114),(115,120),(121,127),(128,134),(135,142),(143,149)]
practical={12:[13],16:[17],21:[23],27:[29],33:[35],39:[41],46:[48],54:[56],62:[64],70:[72],83:[85],89:[92],96:[98],102:[104],108:[109],115:[117],121:[123],128:[130],135:[136],143:[144]}
heading=re.compile(r'^(\d+\s+[A-Z][A-Z ,&–—-]+\s*\|\s*\d+\s*MIN)\s*(.*)$')
def activity(start,end):
 steps=[]
 for index in practical[start]:
  pg=pages[index];current=None
  figs=[img for b in pg for img in b.get('images',[]) if Image.open(Path('dist/simulators/csl-8')/img).width>200]
  def append(t,b):
   nonlocal current
   match=heading.match(t)
   if match:
    current={'title':match.group(1),'blocks':[],'page':index+1,'pageFigure':figs[0] if figs else None};steps.append(current)
    if match.group(2):current['blocks'].append({'kind':'paragraph','text':match.group(2),'images':b.get('images',[])})
   elif current:current['blocks'].append(b)
  for b in pg[2:]:
   if b['kind']=='table':
    # Pollination's five numbered picture steps are rows of the original table.
    for row in b['rows']:
     text=' '.join(c['text'] for c in row).strip();imgs=[im for c in row for im in c['images']]
     append(text,{'kind':'paragraph','text':text,'images':imgs})
   else:append(b.get('text',''),b)
  # Keep trailing reflection/session information on the original page, not as part of the final practical step.
  if current:
   tail=next((i for i,b in enumerate(current['blocks']) if (b.get('text','').startswith(('FINAL ','DIGITAL CHECK','STOP AND ASK')))),None)
   if tail is not None:current['blocks']=current['blocks'][:tail]
 return {'title':pages[start][1]['text'],'overview':pages[start],'sourcePages':list(range(start+1,end+2)),'pages':pages[start:end+1],'steps':steps}
data={'source':{'file':source.name,'libraryId':'libfile_2ad6da08b46481919c52af839b372aa0','version':20,'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pageNumbering':'Printed workbook number; PDF physical page is one greater'},'life':[activity(*r) for r in life_indices],'services':[activity(*r) for r in service_indices],'toolkit':{'life':[],'services':[]}}
for form,index in [('life',10),('services',82)]:
 for b in pages[index]:
  if b['kind']!='table':continue
  for row in b['rows'][1:]:
   if form=='life':data['toolkit'][form].append({'name':row[1]['text'],'usage':row[2]['text'],'when':row[3]['text'],'image':(row[0]['images'] or [None])[0]})
   else:data['toolkit'][form].append({'name':row[0]['text'],'usage':row[1]['text'],'when':row[2]['text'],'image':None})
pdf=fitz.open(args.pdf)
# Source-only project artwork from the original project introductions.
for form,physical in [('life',7),('services',80)]:
 info=pdf[physical-1].get_image_info()
 suitable=[i for i in info if i['width']>400 and i['height']>150]
 if suitable:
  pg=pdf[physical-1];pix=pg.get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(suitable[0]['bbox']));Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/(form+'-project.webp'),'WEBP',quality=92)
  data[form+'Image']='book/'+form+'-project.webp'
 else:
  data[form+'Image']=next((im for b in data[form][0]['overview'] for im in b.get('images',[])),None)
for n in list(range(6,79))+list(range(79,151)):
 pg=pdf[n];pix=pg.get_pixmap(matrix=fitz.Matrix(1.65,1.65));Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/f'page-{n}.webp','WEBP',quality=87)
from collections import Counter
counts=Counter(im for f in ['life','services'] for a in data[f] for pg in a['pages'] for b in pg for im in b.get('images',[]))
data['icons']=[im for im,n in counts.items() if n>15 and .65<Image.open(Path('dist/simulators/csl-8')/im).width/Image.open(Path('dist/simulators/csl-8')/im).height<1.5]
Path('dist/simulators/csl-8/book-data.js').write_text('const CSLBook='+json.dumps(data,ensure_ascii=False)+';\n')
for form in ['life','services']:
 for a in data[form]:print(a['title'],len(a['steps']),[t['title'] for t in a['steps']])
print('Figures',len(list(out.glob('figure-*'))),'pages',len(list(out.glob('page-*'))))
