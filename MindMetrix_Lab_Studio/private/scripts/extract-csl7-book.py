"""Extract user-owned workbook figures, exact text and page facsimiles. No external assets."""
from zipfile import ZipFile
from lxml import etree as E
from pathlib import Path
from PIL import Image
import io,json,re,hashlib,fitz
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--docx',required=True);parser.add_argument('--pdf',required=True);args=parser.parse_args()
source=Path(args.docx)
out=Path('dist/simulators/csl-7/book');out.mkdir(parents=True,exist_ok=True)
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
life_indices=[(13,18),(19,24),(25,30),(31,36),(37,44)]
service_indices=[(58,61),(62,65),(66,72),(73,80),(81,87),(88,94),(95,101)]
actual_life=[(15,20),(21,26),(27,32),(33,38),(39,46)]
actual_services=[(61,64),(65,68),(69,75),(76,83),(84,90),(91,97),(98,104)]
def activity(start,end,actual):
 allpages=pages[start:end+1];steps=[]
 practical={13:[1,2],19:[1,2],25:[1,2],31:[1,2],37:[1,2],58:[0],62:[0,1],66:[1,2],73:[1,2,3,4],81:[1,2,4],88:[1,2,3],95:[1,2,3]}[start]
 for offset in practical:
  pg=allpages[offset];current=None
  for b in pg[2:]:
   t=b.get('text','')
   if re.match(r'^\d+\s*[•·]',t):
    current={'title':t,'blocks':[],'page':actual[0]+offset,'pageFigure':next((img for bb in pg for img in bb.get('images',[]) if Image.open(Path('dist/simulators/csl-7')/img).width>150),None)};steps.append(current)
   elif current:current['blocks'].append(b)
 return {'title':allpages[0][1]['text'],'overview':allpages[0],'sourcePages':list(range(actual[0],actual[1]+1)),'pages':allpages,'steps':steps}
data={'source':{'file':'Class7_First_Aid_Help_Point_Map.docx','libraryId':'libfile_2d7d6dc0c11881919d3a44849208ba55','version':10,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()},'life':[activity(*a,b) for a,b in zip(life_indices,actual_life)],'services':[activity(*a,b) for a,b in zip(service_indices,actual_services)],'toolkit':[]}
for i in [10,11]:
 for b in pages[i]:
  if b['kind']=='table':
   for row in b['rows'][1:]:data['toolkit'].append({'name':row[1]['text'],'usage':row[2]['text'],'image':row[0]['images'][0]})
# Original illustrations/text are also available as complete page images, unaltered.
pdf=fitz.open(args.pdf)
pg=pdf[57];pix=pg.get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(pg.get_image_info()[0]['bbox']));Image.frombytes('RGB',(pix.width,pix.height),pix.samples).save(out/'preparedness-project.webp','WEBP',quality=92)
for n in list(range(12,47))+list(range(58,105)):
 pg=pdf[n-1];pix=pg.get_pixmap(matrix=fitz.Matrix(1.7,1.7));im=Image.frombytes('RGB',(pix.width,pix.height),pix.samples);im.save(out/f'page-{n}.webp','WEBP',quality=87)
Path('dist/simulators/csl-7/book-data.js').write_text('const CSLBook='+json.dumps(data,ensure_ascii=False)+';\n')
# Compact figure contact sheet for visual QA.
figures=[]
for i in [14,15,20,21,26,27,32,33,38,62,63,67,68,74,75,76]:
 for b in pages[i]:
  for img in b.get('images',[]):figures.append((i,img))
contact=Image.new('RGB',(1000,((len(figures)+4)//5)*160),'#f5f5f5')
from PIL import ImageDraw
for j,(i,img) in enumerate(figures):
 im=Image.open(Path('dist/simulators/csl-7')/img);im.thumbnail((190,130));x=j%5*200;y=j//5*160;contact.paste(im,(x,y+20));ImageDraw.Draw(contact).text((x,y),f'{i} {Path(img).stem[-6:]}',fill='black')
contact.save('/tmp/csl7-book-figures.jpg')
print('Extracted',len(list(out.glob('figure-*'))),'figures and',len(list(out.glob('page-*'))),'pages; toolkit',len(data['toolkit']))
for form in ['life','services']:
 for a in data[form]:print(a['title'],[s['title'] for s in a['steps']][:12])
