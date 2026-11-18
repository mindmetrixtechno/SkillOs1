(()=>{
let publications=[];let preferred='en';try{preferred=localStorage.getItem('skillos.language')||'en'}catch{}
window.loadPublishedProjects=async()=>{try{publications=(await studioAPI('published')).projects;const route=location.hash.split('/')[0];if(route==='#curriculum'||route==='#skill-labs')render()}catch{}};
window.mountPublishedProjects=(page,lab,grade,form)=>{
 const app=document.getElementById('app');const relevant=publications.filter(p=>page==='curriculum'?(!lab||p.grade===lab):(!lab||(p.lab===lab&&(!grade||p.grade===grade)&&(!form||form==='project'||p.workForm===form))));
 if(!relevant.length)return;
 const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const names={en:'English',hi:'हिन्दी',te:'తెలుగు',kn:'ಕನ್ನಡ',ta:'தமிழ்',gu:'ગુજરાતી'};
 const section=document.createElement('section');section.className='card';section.dataset.noTranslate='';section.innerHTML='<h2>Published workbook projects</h2><p>Choose an approved language edition. The workbook, lab and simulator use the same content.</p><div class="maker-grid">'+[...new Set(relevant.map(p=>p.projectId))].map(id=>{const editions=relevant.filter(p=>p.projectId===id),p=editions.find(p=>p.language===preferred)||editions[0];return '<article class="card published-tile"><small>Class '+p.grade+' · '+E(p.lab)+'</small><h3>'+E(p.title)+'</h3><label>Language <select data-edition="'+id+'">'+editions.map(x=>'<option value="'+x.language+'" '+(x.language===p.language?'selected':'')+'>'+names[x.language]+'</option>').join('')+'</select></label><p><a data-edition-link="'+id+'" href="/studio-reader.html?project='+id+'&lang='+p.language+'">Open project →</a></p></article>'}).join('')+'</div>';app.prepend(section);
 section.querySelectorAll('[data-edition]').forEach(select=>select.onchange=()=>{preferred=select.value;try{localStorage.setItem('skillos.language',preferred)}catch{}section.querySelector('[data-edition-link="'+select.dataset.edition+'"]').href='/studio-reader.html?project='+select.dataset.edition+'&lang='+preferred});
};
window.addEventListener('DOMContentLoaded',()=>loadPublishedProjects());
})();
