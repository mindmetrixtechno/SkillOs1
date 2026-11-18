const skillCopy = {
 'Language / भाषा':'भाषा / Language','Learn by making.':'बनाकर सीखें।',
 'Explore a kit, test an idea in a simulator, then build and improve it in your school lab.':'किट के पुर्ज़े जानें, सिम्युलेटर में अपना विचार परखें और स्कूल की लैब में मॉडल बनाकर सुधारें।',
 'Sign in to SkillOS':'SkillOS में प्रवेश करें','User ID':'यूज़र आईडी','Password':'पासवर्ड','Sign in':'प्रवेश करें','Sign out':'साइन आउट','Demo sign-in':'डेमो प्रवेश','Use the demo user ID and password.':'डेमो यूज़र आईडी और पासवर्ड डालें।',
 'Dashboard':'डैशबोर्ड','Curriculum':'पाठ्यक्रम','Skill Labs':'कौशल लैब','Students':'विद्यार्थी','Analytics':'विश्लेषण','AI Assistant':'एआई सहायक',
 'Workbook':'कार्यपुस्तिका','Simulator':'सिम्युलेटर','Classwise Curriculum':'कक्षावार पाठ्यक्रम','Planning Board':'योजना बोर्ड','Grade':'कक्षा','Learning Area':'अध्ययन क्षेत्र','Module':'मॉड्यूल','Activity':'गतिविधि',
 'Robotics Lab':'रोबोटिक्स लैब','AI Lab':'एआई लैब','CSL Lab':'समग्र कौशल लैब','IT Lab':'आईटी लैब','Choose a lab to explore.':'देखने के लिए एक लैब चुनें।','Select a class to see its projects.':'परियोजनाएँ देखने के लिए कक्षा चुनें।',
 'Build and test machines that sense and respond.':'ऐसी मशीनें बनाएँ और परखें जो संकेत पहचानकर प्रतिक्रिया देती हैं।','Use examples and evidence to test AI predictions.':'उदाहरण और प्रमाण से एआई के अनुमान परखें।','Explore projects across the three forms of work.':'कार्य के तीन रूपों से जुड़ी परियोजनाएँ देखें।','Apply digital tools to practical tasks.':'व्यावहारिक कामों में डिजिटल साधनों का उपयोग करें।',
 '← All skill labs':'← सभी कौशल लैब','Explore project →':'परियोजना देखें →','What you’ll build':'आप क्या बनाएँगे','Outcome':'अपेक्षित परिणाम','What you’ll learn':'आप क्या सीखेंगे',
 'Meet the Lab':'लैब से परिचय','Select a component to see its role.':'किसी पुर्ज़े को चुनकर उसका काम जानें।','Audio language':'ऑडियो की भाषा','Listen':'सुनें','Stop audio':'ऑडियो रोकें',
 'Previous page':'पिछला पृष्ठ','Next page':'अगला पृष्ठ','Open full-screen reader':'पूरी स्क्रीन में पढ़ें','Close reader':'पाठक बंद करें','View only':'केवल पढ़ें','Zoom':'ज़ूम','Fit width':'चौड़ाई के अनुसार',
 'Skill Development Overview':'कौशल विकास का सार','Recent Activities':'हाल की गतिविधियाँ','Teachers':'शिक्षक','Active Projects':'सक्रिय परियोजनाएँ','Projects':'परियोजनाएँ','Student':'विद्यार्थी','Skill Progress':'कौशल प्रगति','Project Completion':'परियोजना पूर्णता','Grade-wise Progress':'कक्षावार प्रगति',
 'Farmer’s Buddy':'किसान का साथी','Mission Rover':'मिशन रोवर','Autonomous Mission Rover':'स्वचालित मिशन रोवर',
 'Build a smart classroom':'स्मार्ट कक्षा बनाएँ','Save record':'रिकॉर्ड सहेजें','Teacher Session Desk':'शिक्षक के लिए सत्र योजना','Team label':'टीम का नाम',
 '1. Predict':'1. अनुमान लगाएँ','2. Simulate':'2. सिम्युलेटर में परखें','3. Build':'3. बनाएँ','4. Compare':'4. तुलना करें','5. Improve':'5. सुधारें',
 'SkillOS Intelligence Assistant':'SkillOS एआई सहायक','Prototype AI — Demonstration':'प्रोटोटाइप एआई — प्रदर्शन','Try a sample question about practical learning.':'व्यावहारिक सीखने से जुड़ा एक प्रश्न आज़माएँ।','Suggest a skill lab activity':'कौशल लैब की गतिविधि सुझाएँ','Create a learning activity':'सीखने की गतिविधि बनाएँ','Identify skill gaps':'कौशल में कमियाँ पहचानें',
 'Prototype · Demo data':'प्रोटोटाइप · डेमो डेटा'
};
const originalSkillText=new WeakMap();
let skillLanguage='en';
let signedIn=false;
try{skillLanguage=sessionStorage.getItem('skill.ui')==='hi'?'hi':'en';signedIn=sessionStorage.getItem('skill.demo')==='yes'}catch{}
function skillSignedIn(){return signedIn}
function translateSkillOS(){
 document.documentElement.lang=skillLanguage;
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 while(walker.nextNode()){
  const node=walker.currentNode;
  if(node.parentElement.closest('script,style,textarea,input,[data-no-translate]'))continue;
  const source=originalSkillText.get(node)||node.nodeValue;
  const key=source.trim();
  const grade=key.match(/^(?:Grade|Class) (\d+)$/);
  const page=key.match(/^Page (\d+) of (\d+)$/);
  const translated=skillLanguage==='hi'?(Object.hasOwn(skillCopy,key)?skillCopy[key]:grade?'कक्षा '+grade[1]:page?'पृष्ठ '+page[1]+' / '+page[2]:key):key;
  const value=key?source.replace(key,translated):source;
  if(value!==node.nodeValue){originalSkillText.set(node,source);node.nodeValue=value}
 }
 document.querySelectorAll('[data-ui-language]').forEach(picker=>picker.value=skillLanguage);
}
function setupSkillInterface(){
 const shell=document.querySelector('.shell');
 const tools=document.createElement('div');
 tools.className='account-controls';
 tools.innerHTML='<label>Language / भाषा <select data-ui-language><option value="en">English</option><option value="hi">हिन्दी</option></select></label><button id="skill-logout">Sign out</button>';
 (shell.querySelector('header')||shell).append(tools);
 function refresh(){
  document.body.classList.toggle('signed-out',!signedIn);
  if(signedIn)render();
  translateSkillOS();
 }
 document.querySelectorAll('[data-ui-language]').forEach(picker=>picker.onchange=()=>{
  skillLanguage=picker.value;
  try{sessionStorage.setItem('skill.ui',skillLanguage)}catch{}
  translateSkillOS();
 });
 const form=document.getElementById('skill-login');
 form.onsubmit=event=>{
  event.preventDefault();
  const data=new FormData(form);
  if(data.get('user')!=='admin'||data.get('password')!=='admin'){
   document.getElementById('login-error').replaceChildren(document.createTextNode('Use the demo user ID and password.'));
   translateSkillOS();
   return;
  }
  signedIn=true;
  try{sessionStorage.setItem('skill.demo','yes')}catch{}
  form.reset();document.getElementById('login-error').textContent='';refresh();
 };
 document.getElementById('skill-logout').onclick=()=>{
  signedIn=false;
  try{sessionStorage.removeItem('skill.demo')}catch{}
  window.stopLabAudio?.();
  document.getElementById('app').replaceChildren();
  refresh();
 };
 refresh();
 new MutationObserver(records=>{
  if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType!==1||node.tagName!=='IFRAME')))translateSkillOS();
 }).observe(shell,{childList:true,subtree:true});
}
