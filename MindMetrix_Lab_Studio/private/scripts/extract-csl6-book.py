"""Extract user-owned workbook figures, exact text and page facsimiles. No external assets."""
from zipfile import ZipFile
from lxml import etree as E
from pathlib import Path
from PIL import Image
import io,json,re,hashlib,fitz
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--docx',required=True);parser.add_argument('--pdf',required=True);args=parser.parse_args()
source=Path(args.docx)
out=Path('dist/simulators/csl-6/book');out.mkdir(parents=True,exist_ok=True)
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
 if b.xpath('./w:pPr/w:pageBreakBefore',namespaces=ns) and buf:pages.append(buf);buf=[]
 if text(b) or b.xpath('.//a:blip',namespaces=ns):buf.append(block(b))
pages.append(buf)

life_indices=[(14,17),(18,21),(22,25),(26,29),(30,37)]
service_indices=[(46,49),(50,53),(54,58),(59,62),(63,70)]
practical={14:15,18:19,22:23,26:27,30:32,46:47,50:51,54:56,59:60,63:64}
stepInline=re.compile(r'^(STEP\s*\d+\s*[•·]\s*[A-Z0-9 &,/’–—-]+)\s+([A-Z][a-z].*)$')
stepHeading=re.compile(r'^\d+\s*[•·].+\|\s*\d+\s*MIN$')
def activity(start,end):
 index=practical[start];pg=pages[index];steps=[];current=None
 figs=[im for b in pg for im in b.get('images',[])]
 for b in pg[2:]:
  candidates=[]
  if b['kind']=='table':
   for row in b['rows']:
    candidates.append({'kind':'paragraph','text':' '.join(c['text'] for c in row).strip(),'images':[im for c in row for im in c['images']]})
  else:candidates=[b]
  for item in candidates:
   t=item.get('text','');m=stepInline.match(t)
   if m:
    current={'title':m.group(1),'blocks':[{'kind':'paragraph','text':m.group(2),'images':item.get('images',[])}],'page':index+2,'pageFigure':figs[0] if figs else None};steps.append(current)
   elif stepHeading.match(t):
    current={'title':t,'blocks':[],'page':index+2,'pageFigure':figs[0] if figs else None};steps.append(current)
   elif current:
    if t.startswith(('SUNLIGHT TARGET','DID YOU KNOW','FINISH SAFELY','SAFE HANDS','TEACHER-LED','STOP •','RESPECT &','SAFETY FIRST','SAFETY &','I COULD','I CAN TRY')):current=None
    else:current['blocks'].append(item)
 return {'title':pages[start][1]['text'],'overview':pages[start],'sourcePages':list(range(start+2,end+3)),'pages':pages[start:end+1],'steps':steps}
data={'source':{'file':source.name,'libraryId':'libfile_a9a59586dc1c819182621a224edebc13','edition':'v34','sha256':hashlib.sha256(source.read_bytes()).hexdigest()},'life':[activity(*r) for r in life_indices],'services':[activity(*r) for r in service_indices],'toolkit':{'life':[],'services':[]}}
for form,index in [('life',10),('services',43)]:
 for b in pages[index]:
  if b['kind']!='table':continue
  for row in b['rows'][1:]:
   if form=='life' and len(row)==4 and row[2]['text']:
    data['toolkit'][form].append({'name':row[2]['text'],'usage':row[3]['text'],'when':'','image':next(iter(row[1]['images']),None)})
   if form=='services' and len(row)==3 and row[0]['text']:
    data['toolkit'][form].append({'name':row[0]['text'],'usage':row[1]['text'],'when':row[2]['text'],'image':None})
from collections import Counter
counts=Counter(im for form in ['life','services'] for a in data[form] for pg in a['pages'] for b in pg for im in b.get('images',[]))
data['icons']=[str(x.relative_to(out.parent)) for x in out.glob('figure-*') if .7<Image.open(x).width/Image.open(x).height<1.35]
for form in ['life','services']:
 for a in data[form]:a['stageFigure']=next((im for b in a['overview'] for im in b.get('images',[]) if im not in data['icons']),None)
pdf=fitz.open(args.pdf)
for form,n in [('life',9),('services',41)]:
 pg=pdf[n-1];infos=[x for x in pg.get_image_info() if x['width']>300 and x['height']>100]
 if infos:
  chosen=max(infos,key=lambda x:(x['bbox'][2]-x['bbox'][0])*(x['bbox'][3]-x['bbox'][1]));pix=pg.get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(chosen['bbox']));Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/(form+'-project.webp'),'WEBP',quality=92)
  data[form+'Image']='book/'+form+'-project.webp'
pg=pdf[44];infos=[x for x in pg.get_image_info() if x['width']>300 and x['height']>100];chosen=max(infos,key=lambda x:(x['bbox'][2]-x['bbox'][0])*(x['bbox'][3]-x['bbox'][1]));pix=pg.get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(chosen['bbox']));Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/'services-toolkit.webp','WEBP',quality=92)
for n in range(9,73):
 pg=pdf[n-1];pix=pg.get_pixmap(matrix=fitz.Matrix(1.7,1.7));Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/f'page-{n}.webp','WEBP',quality=87)
# Source recipe card retained as its original blocks and page image.
data['recipeCard']={'page':57,'blocks':pages[55]}
Path('dist/simulators/csl-6/book-data.js').write_text('const CSLBook='+json.dumps(data,ensure_ascii=False)+';\n')
for form in ['life','services']:
 for a in data[form]:print(a['title'],len(a['steps']),[t['title'] for t in a['steps']])
print('Toolkits', {k:len(v) for k,v in data['toolkit'].items()},'figures',len(list(out.glob('figure-*'))))
