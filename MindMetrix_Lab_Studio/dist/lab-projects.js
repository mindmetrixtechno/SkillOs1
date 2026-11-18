const labTypes={robotics:['Robotics Lab','Build and test machines that sense and respond.'],ai:['AI Lab','Use examples and evidence to test AI predictions.'],csl:['CSL Lab','Explore projects across the three forms of work.'],it:['IT Lab','Apply digital tools to practical tasks.']};
const gradeProjects={
 '6':{name:'Gordon — Farmer’s Buddy',image:'finished-system.jpg',build:'A soil-sensing model that controls a watering pump.',outcome:'Demonstrate when Gordon waters and when it stays off.',learn:'Read a sensor, set a threshold and test a controlled output.',parts:[
 ['Soil sensor','Measures the soil condition and sends a reading to Arduino.','part-0.jpg'],['Arduino UNO','Compares the reading with the watering threshold.','part-1.jpg'],['Motor driver','Switches power to the pump when Arduino requests a dose.','part-2.jpg'],['Tank and pump','Stores water and moves a small dose through the tube.','part-3.jpg'],['Delivery tube','Carries water to the soil.','part-4.jpg'],['Plant and pot','Receives the water. The cooldown gives it time to spread.','part-5.jpg']],
 steps:['Start in Tinkercad','Connect the circuit','Build the watering rule','Test the three-dose limit','Build the physical model','Calibrate the sensor','Test the watering system','Troubleshoot and present'].map((name,i)=>['c'+(i+1),name])},
 '7':{name:'Autonomous Mission Rover',image:'rover.jpg',build:'A two-wheel rover that follows a marked path and detects an obstacle ahead.',outcome:'Run a delivery mission and explain the rover’s steering and stop decisions.',learn:'Connect motor commands, track readings and obstacle distance to movement.',parts:[
 ['Arduino UNO','Reads the sensors and tells the driver when to move or stop.'],['Motor driver','Controls the power and direction of two motors.'],['Ultrasonic sensor','Estimates distance to an obstacle using an echo.'],['IR sensors','Detect the surfaces under the rover to guide its steering.'],['Wheels and motors','Drive and turn the rover.'],['Chassis','Holds the parts in position.'],['Battery pack','Supplies power to the motor circuit.']].map((part,i)=>[...part,'rover-part-'+i+'.jpg']),
 steps:['Meet the Mission','Give Your Rover a Body','Controlled Movement','Read the Path','Path-Following Rules','Notice an Obstacle','Combine Sense and Move','Classroom Delivery Mission'].map((name,i)=>[String(i+1),name])},
 '8':{name:'SmartSpace',image:'room.jpg',build:'An ESP32 classroom model with a room light, fan, servo door and status display.',outcome:'Demonstrate local, remote and automatic control and compare lighting rules.',learn:'Read sensor inputs, send commands, test thresholds and explain the evidence.',parts:[
 ['ESP32','Reads sensors and applies control rules.','part-esp.jpg'],['Light sensor','Measures the light level as a raw ADC reading.','part-ldr.jpg'],['DHT11','Measures temperature and humidity.','part-dht.jpg'],['PIR sensor','Detects movement.','part-pir.jpg'],['LED light','Shows the lighting output.','part-lamp.jpg'],['Fan','Provides the model’s ventilation response.','part-fan.jpg'],['Servo door','Moves the door between open and closed positions.','part-door.jpg'],['LCD','Shows readings, mode and output states.','part-lcd.jpg'],['Buzzer','Signals an event with a short alert.']],
 steps:['Build the Brain','Control Without Wires','Bring SMARTSPACE Online','Give SMARTSPACE Senses','Make SMARTSPACE Respond','Make SMARTSPACE Automatic','Build the IoT Control Centre','Three Ways to Control SMARTSPACE','AI for SMARTSPACE','We Built SMARTSPACE!'].map((name,i)=>[String(i),name])}
};
const aiProjects={
 '6':{name:'AI Explorer',build:'A practice prediction and evidence check.',outcome:'Explain how you checked a prediction.',learn:'Use examples and human review.',steps:[['ai','AI Explorer']]},
 '7':{name:'AI Rover Trainer',build:'A card-based rehearsal for a paper rover.',outcome:'Compare left, right, stop and unclear predictions.',learn:'Check classifications before acting.',steps:[['9','AI Rover Trainer']]},
 '8':{name:'Can AI Help Us Save Energy?',build:'A simulated decision tree and a fair test of two lighting rules.',outcome:'Compare light ON-time and useful lighting.',learn:'Train on examples, test unseen data and review a prediction.',steps:[['8','AI for SMARTSPACE']]}
};
const cslForms={life:'Life Forms',machines:'Machines & Materials',services:'Human Services'};
const cslProjects={
 '6-life':{id:'container-garden-6',name:'Terrace & Container Gardening',build:'A teacher-approved container garden, growing mix, sowing and care records.',outcome:'Measure and explain the garden’s development, harvest and estimated value.',learn:'Audit a site, measure a growing mix, sow, observe, care and record evidence.',steps:['Investigate Your Space','Build a Home for Roots','Seed Selection & Precision Sowing','Organic Plant Care','Harvest, Weigh & Value'],pages:[16,20,24,28,32]},
 '6-services':{id:'farm-table-6',name:'Farm to Table — School Health & Wellness Kiosk',build:'A safe kiosk layout, checked menu, measured trial and service evidence.',outcome:'Explain preparation, service, waste and counted batch costs using real records.',learn:'Practise hygiene, listen fairly, measure, serve, sort and explain value.',steps:['Set Up a Safe Kiosk','Listen & Plan Our Menu','Measure & Make','Serve & Sort','Value & Share'],pages:[48,52,56,61,65]},
 '7-life':{id:'soil-seed-7',name:'Soil & Seed Lab',build:'A compost setup, soil investigation and a fair seed-growth comparison.',outcome:'Present measured observations and explain a fair comparison.',learn:'Sort, observe, measure, compare and share evidence.',steps:['Waste to Compost','Soil Detectives','Investigate Seed Germination','Set Up a Fair Growth Comparison','Measure, Interpret and Share'],pages:[15,21,27,33,39]},
 '7-services':{id:'preparedness-7',name:'School Emergency Preparedness',build:'A checked help-point map and a school emergency help guide.',outcome:'Share an improved guide using the school’s approved plan.',learn:'Report facts, find adult help, map routes and test a guide.',steps:['Get help safely','Map Your School’s Help Points','Meet the School First-Aid Kit','Choose a Safe Response','Practise Our School Emergency Plan','Test and Improve Our Help Guide','Share Our Preparedness Work'],pages:[61,65,69,76,84,91,98]},
 '8-life':{id:'pollinator-8',name:'Pollinator Paradise',build:'An evidence-led improvement to a teacher-approved school habitat.',outcome:'Compare observations and hand over a care plan.',learn:'Map, observe, measure consistently, budget and review evidence.',steps:['Explore the Ecosystem','Meet the Flower Visitors','Investigate Pollination','Measure Consistently','Identify Habitat Gaps','Design and Budget','Improve the Habitat','Care and Monitor','Compare and Improve','Present and Hand Over'],pages:[13,17,22,28,34,40,47,55,63,71]},
 '8-services':{id:'event-8',name:'Event Management — The School Event Challenge',build:'A planned, rehearsed school event and visitor-service experience.',outcome:'Evaluate the event and hand over lessons learned.',learn:'Understand visitors, organise roles, budget, communicate and improve.',steps:['Understand the Event Brief','Know Your Visitors','Build the Event Team','Design the Visitor Experience','Plan Time and Resources','Communicate and Invite','Prepare Visitor Services','Prepare for Problems','Rehearse and Deliver','Evaluate and Hand Over'],pages:[84,90,97,103,109,116,122,129,136,144]}
};
function labEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function projectRecord(grade,p){
 const key=p.id||'robotics-'+grade;
 return '<section class="card"><h2>Project evidence</h2><p>One shared record for this project, including when opened through another lab. Notes stay in this browser.</p><form id="shared-project-record" data-record="'+key+'"><label>Team label <input name="team" maxlength="60"></label><label>Our prediction<textarea name="prediction"></textarea></label><label>What we built and observed<textarea name="evidence"></textarea></label><label>What we improved and why<textarea name="improvement"></textarea></label><button>Save project notes</button><span role="status" id="shared-save-status"></span></form></section>';
}
function labDirectory(type,grade,project,detail){
 if(type==='smartspace')return labDirectory('robotics','8','project');
 if(/^\d+$/.test(type||''))return labPage(type);
 const lab=Object.hasOwn(labTypes,type)?labTypes[type]:null;
 if(!lab)return pageTitle('Skill Labs','Choose your lab, class and making experience.')+'<div class="maker-grid">'+Object.entries(labTypes).map(([key,[title,description]])=>'<a class="card lab-choice" href="#skill-labs/'+key+'"><h2>'+title+'</h2><p>'+description+'</p><span>Explore lab →</span></a>').join('')+'</div>';
 const base='#skill-labs/'+type;
 const p=Object.hasOwn(gradeProjects,grade)?gradeProjects[grade]:null;
 const classes='<nav class="class-tabs" aria-label="Select class">'+Object.keys(gradeProjects).map(g=>'<a href="'+base+'/'+g+'" '+(g===grade?'aria-current="page"':'')+'>Class '+g+'</a>').join('')+'</nav>';
 const header='<p><a href="#skill-labs">← All skill labs</a></p>'+pageTitle(lab[0],lab[1])+classes;
 if(!p)return header+'<p>Select a class to see its projects.</p>';
 if(type==='it')return header+'<p>No IT projects are configured for this class yet.</p>';
 let selected=type==='ai'?{...p,...aiProjects[grade],id:'ai-'+grade}:{...p,id:'robotics-'+grade};
 let projectUrl=base+'/'+grade+'/project',back=base+'/'+grade;
 if(type==='csl'){
  // Old CSL project links now enter the form directory instead of silently selecting SmartSpace.
  if(!Object.hasOwn(cslForms,project))return header+'<h2>Choose a form of work</h2><div class="maker-grid">'+Object.entries(cslForms).map(([key,label])=>'<a class="card lab-choice" href="'+base+'/'+grade+'/'+key+'"><h2>'+label+'</h2><p>View the school-selected project →</p></a>').join('')+'</div>';
  const candidate=project==='machines'?selected:cslProjects[grade+'-'+project];
  back=base+'/'+grade+'/'+project;projectUrl=back+'/project';
  const formHeader='<p><a href="'+base+'/'+grade+'">← Three forms of work</a></p><h2>'+cslForms[project]+'</h2>';
  if(!candidate)return header+formHeader+'<section class="card"><h3>Workbook configuration needed</h3><p>The Class '+grade+' workbook for this form has not been configured. Add its approved project and activity sequence before offering it to students.</p></section>';
  selected=candidate;
  const selectionKey='skillos.school-project.'+grade+'.'+project;
  let chosen=false;try{chosen=localStorage.getItem(selectionKey)===selected.id}catch{}
  if(detail!=='project'||!chosen)return header+formHeader+'<section class="card"><h3>School project selection</h3><p>Choose the project offered to this class. This prototype saves the selection in this browser.</p><form id="school-project-choice" data-selection-key="'+selectionKey+'" data-next="'+projectUrl+'"><label>Available project <select name="project"><option value="">Select a project</option><option value="'+selected.id+'" '+(chosen?'selected':'')+'>'+labEscape(selected.name)+'</option></select></label><button>Use this project</button><p role="status" id="school-choice-status"></p></form></section>'+(chosen?labProjectCard(projectUrl,selected.name,project==='machines'?'simulators/grade-'+grade+'/'+p.image:cslProjectImage(grade,project)):'');
 }
 const isCSL=Boolean(selected.pages);
 const img=isCSL?(cslProjectImage(grade,project)):'simulators/grade-'+grade+'/'+selected.image;
 if(type!=='csl'&&project!=='project')return header+labProjectCard(projectUrl,selected.name,img);
 return header+'<p><a href="'+back+'">← Class '+grade+' projects</a></p><section class="card maker-hero"><div class="maker-grid"><div><span class="badge">Class '+grade+(type==='csl'?' · '+cslForms[project]:' · '+lab[0])+'</span><h2>'+selected.name+'</h2><p><strong>What you’ll build</strong> · '+selected.build+'</p><p><strong>Outcome</strong> · '+selected.outcome+'</p><p><strong>What you’ll learn</strong> · '+selected.learn+'</p>'+(type==='csl'&&project==='machines'?'<p>Shared with Robotics Lab: the same activities and project evidence.</p>':'')+'</div><img src="'+img+'" alt="'+labEscape(selected.name)+'"></div></section>'+(isCSL?cslActivityPanel(grade,project,selected):'<section class="card" data-lab-project="'+type+'" data-class="'+grade+'"><label>Activity <select id="lab-activity"><option value="meet">Meet the Lab</option>'+selected.steps.map(([id,name],i)=>'<option value="'+id+'">'+(i+1)+' · '+name+'</option>').join('')+'</select></label><div id="lab-activity-view"></div></section>')+projectRecord(grade,selected);
}
function cslActivityPanel(grade,form,p){
 return '<section class="card" data-csl-project="'+grade+'-'+form+'"><label>Activity <select id="csl-activity"><option value="meet">Meet the Lab</option>'+p.steps.map((name,i)=>'<option value="'+i+'">'+(i+1)+' · '+name+'</option>').join('')+'</select></label><div id="csl-activity-view"></div></section>';
}
function mountLabStructure(){
 const choice=document.getElementById('school-project-choice');
 if(choice)choice.onsubmit=e=>{e.preventDefault();if(!choice.project.value){document.getElementById('school-choice-status').textContent='Select a project first.';return}try{localStorage.setItem(choice.dataset.selectionKey,choice.project.value);location.hash=choice.dataset.next;render()}catch{document.getElementById('school-choice-status').textContent='Enable browser storage to save the school selection.'}};
 const form=document.getElementById('shared-project-record');
 if(form){const key=form.dataset.record==='robotics-8'?makerKey:'skillos.project.'+form.dataset.record;const status=document.getElementById('shared-save-status');try{const saved=JSON.parse(localStorage.getItem(key)||'{}');for(const field of form.querySelectorAll('[name]'))field.value=saved[field.name]||'';if(saved.simulator){const notes=document.createElement('details');notes.className='card';notes.innerHTML='<summary>Saved simulator observations</summary>'+Object.values(saved.simulator).map(n=>'<h3>'+labEscape(n.activity)+'</h3><p>'+labEscape(n.observation||'')+'</p><p>'+labEscape(n.modelFeedback||'')+'</p><small>Browser rehearsal</small>').join('');form.after(notes)}}catch{}form.onsubmit=e=>{e.preventDefault();try{localStorage.setItem(key,JSON.stringify({...JSON.parse(localStorage.getItem(key)||'{}'),...Object.fromEntries(new FormData(form))}));status.textContent=' Saved in this browser.'}catch{status.textContent=' Could not save. Browser storage is unavailable.'}}}
 const section=document.querySelector('[data-csl-project]');
 if(section){const p=cslProjects[section.dataset.cslProject],picker=section.querySelector('select'),view=section.querySelector('#csl-activity-view');function show(){stopLabAudio();const [grade,form]=section.dataset.cslProject.split('-');if(['6','7','8'].includes(grade)){const src='simulators/csl-'+grade+'/index.html?form='+form+'&activity='+(picker.value==='meet'?'-1':picker.value);view.innerHTML='<p><a href="'+src+'" target="_blank" rel="noopener">Open simulator in a full window ↗</a></p><iframe class="sim-frame" style="height:900px" title="Class '+grade+' '+cslForms[form]+' interactive simulator" src="'+src+'"></iframe>';return}view.innerHTML=picker.value==='meet'?'<h2>Meet the Lab</h2><p>Use the approved workbook toolkit and ask your teacher to check the materials and work area before starting.</p><p>'+p.build+'</p><p>The interactive component guide and workbook pages for this CSL project are awaiting configuration.</p>':'<h2>'+labEscape(p.steps[Number(picker.value)])+'</h2><p>Follow the original workbook from page '+p.pages[Number(picker.value)]+'. The activity order is taken from the Class '+grade+' CSL workbook.</p><p>Keep your practical evidence in the shared project notes below.</p><p><strong>Workbook content pending:</strong> the CSL page viewer is not configured yet. Use the school’s workbook for the detailed steps.</p>'}picker.onchange=show;show()}

}
function cslProjectImage(grade,form){if(grade==='6')return 'simulators/csl-6/book/'+form+'-project.webp';if(grade==='8')return 'simulators/csl-8/book/'+form+'-project.webp';if(grade==='7')return form==='life'?'simulators/csl-7/book/figure-f5b86440693f9fd2.webp':'simulators/csl-7/book/preparedness-project.webp';return 'lab-art/'+form+'.svg'}
function labProjectCard(url,title,img){
 return '<div class="maker-grid"><a class="card lab-choice" href="'+url+'"><img src="'+img+'" alt=""><h2>'+title+'</h2><span>Explore project →</span></a></div>';
}
function stopLabAudio(){window.speechSynthesis?.cancel()}
function mountLabProject(){
 const section=document.querySelector('[data-lab-project]');
 if(!section)return;
 const {labProject:type,class:grade}=section.dataset;
 const root='simulators/grade-'+grade+'/';
 const picker=section.querySelector('select');
 const view=section.querySelector('#lab-activity-view');
 const parts=type==='ai'?[['Browser simulator','Use the browser to test a prediction.'],['Sample examples','Use the examples provided in the workbook activity.'],['Observation notes','Record what you expected and what actually happened.']]:gradeProjects[grade].parts;
 function activity(){
  stopLabAudio();
  if(picker.value!=='meet'){
   view.innerHTML='<p><a href="#curriculum/'+grade+'/workbook">Open the grade workbook →</a></p><iframe class="sim-frame" title="Workbook activity simulator" src="'+root+'index.html?activity='+encodeURIComponent(picker.value)+(type==='ai'&&grade==='8'?'#challenge':'')+'"></iframe>';
   return;
  }
  view.innerHTML='<h2>Meet the Lab</h2><p>Select a component to see its role.</p><div class="maker-grid lab-parts">'+parts.map(([name,,img],i)=>'<button type="button" data-part="'+i+'" aria-pressed="false">'+(img?'<img src="'+root+img+'" alt="">':'')+name+'</button>').join('')+'</div><div id="lab-part-detail" aria-live="polite"></div><label>Audio language <select id="lab-language">'+Object.entries(labLanguages).map(([code,label])=>'<option value="'+code+'">'+label+'</option>').join('')+'</select></label><button type="button" id="lab-listen" disabled>Listen</button> <button type="button" id="lab-stop" disabled>Stop audio</button><p id="audio-status" role="status"></p>';
  const detail=view.querySelector('#lab-part-detail'),listen=view.querySelector('#lab-listen'),stop=view.querySelector('#lab-stop');
  const language=view.querySelector('#lab-language');
  const audioStatus=view.querySelector('#audio-status');
  let selectedIndex;
  language.onchange=()=>{stopLabAudio();audioStatus.textContent=''};
  view.querySelectorAll('[data-part]').forEach(button=>button.onclick=()=>{
   stopLabAudio();
   view.querySelectorAll('[data-part]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
   selectedIndex=Number(button.dataset.part);
   const [name,usage]=parts[selectedIndex];
   const example=labExamples[type==='ai'?'ai':grade][selectedIndex][0];
   detail.textContent=name+'. '+(example.startsWith(usage)?example:usage+' '+example);
   listen.disabled=!window.speechSynthesis||!window.SpeechSynthesisUtterance;
   stop.disabled=listen.disabled;
   audioStatus.textContent=listen.disabled?'Audio is unavailable in this browser.':'';
  });
  listen.onclick=()=>{
   stopLabAudio();
   const code=language.value;
   const index=Object.keys(labLanguages).indexOf(code);
   const engine=window.speechSynthesis;
   const voices=engine.getVoices();
   const voice=voices.find(v=>v.lang.toLowerCase()===code.toLowerCase())||voices.find(v=>v.lang.toLowerCase().split('-')[0]===code.split('-')[0]);
   if(voices.length&&!voice){audioStatus.textContent='This device has no '+labLanguages[code]+' voice. Add it in your device’s speech settings or choose another language.';return}
   const speech=new SpeechSynthesisUtterance(index===0?detail.textContent:labExamples[type==='ai'?'ai':grade][selectedIndex][index]);
   speech.lang=code;
   if(voice)speech.voice=voice;
   speech.onerror=event=>{if(!['canceled','interrupted'].includes(event.error))audioStatus.textContent='Audio could not play. Check your device’s speech settings.'};
   audioStatus.textContent='';
   engine.speak(speech);
  };
  stop.onclick=stopLabAudio;
 }
 picker.onchange=activity;
 activity();
}
window.addEventListener('hashchange',stopLabAudio);
