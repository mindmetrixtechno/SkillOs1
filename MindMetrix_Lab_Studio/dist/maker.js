const makerKey = "skillos.smartspace.record.v1";
function makerBoard() {
  return '<section class="card maker-hero"><div class="maker-grid"><div><span class="badge">Grade 8 · Machines &amp; Materials</span><h2>Build a smart classroom</h2><p>Can you keep the room usefully lit while running the light for less time?</p><a href="#skill-labs/smartspace">Start building →</a></div><img src="simulators/grade-8/room.jpg" alt="SmartSpace classroom model"></div></section><div class="maker-grid"><section class="card"><h3>Life forms · Pollinator project</h3><p>Compare flower visitors at two school sites.</p><small>Project concept</small></section><section class="card"><h3>Human services · Event management</h3><p>Test a visitor’s route and improve the signs.</p><small>Project concept</small></section></div><h2>Lab directory</h2>';
}
function makerWorkspace() {
  return `<p><a href="#skill-labs">← Project Board</a></p>
  <section class="card maker-hero"><div class="maker-grid"><div><span class="badge">Grade 8 · Machines &amp; Materials</span><h1>Build a smart classroom</h1><p>Test the lighting rule in SmartSpace. Build the real model with your teacher, compare your evidence and improve one setting.</p></div><img src="simulators/grade-8/room.jpg" alt="SmartSpace classroom model"></div></section>
  <form id="maker-record"><p>Use a team label. Keep student names out of this demo record.</p><label>Team label <input name="team" maxlength="60" placeholder="Team A"></label>
  <div class="maker-actions"><button type="submit">Save record</button><button type="button" id="maker-print">Print project record</button><span id="maker-status" role="status"></span></div>
  <div class="maker-grid">
  <section class="card"><h2>1. Predict</h2><label>When will the light turn on or off?<textarea name="prediction"></textarea></label></section>
  <section class="card"><h2>2. Simulate</h2><p>Start in AUTO. Try a dark and a bright condition. The demo uses 1600 ADC for ON and 2000 ADC for OFF.</p><a href="#curriculum/8/simulator">Open SmartSpace simulator →</a><label>Record two readings and the light state for each.<textarea name="simulation"></textarea></label></section>
  <section class="card"><h2>3. Build</h2><p>Check the workbook with your teacher. Use the approved ESP32 setup and have the teacher check connections before powering it.</p><a href="#curriculum/8/workbook">Open the workbook →</a><label>What did you build and test?<textarea name="build"></textarea></label></section>
  <section class="card"><h2>4. Compare</h2><label>Record the physical readings and light states. Where did they differ from the simulator?<textarea name="comparison"></textarea></label></section>
  <section class="card"><h2>5. Improve</h2><label>Change one setting, repeat the test, and say whether it helped.<textarea name="improvement"></textarea></label></section>
  </div></form>
  <details class="card"><summary>Teacher Session Desk</summary><p><strong>Prepare:</strong> Check the workbook’s parts list, approved power setup and equipment availability. If kits are shared, rotate teams between simulation and the supervised physical test.</p><p><strong>Review:</strong> Look for a testable prediction, two recorded readings, a comparison with the physical model, and an improvement justified by evidence.</p><p><strong>Alignment:</strong> Machines &amp; Materials project. Students apply sensing and control, measure an outcome, revise a design and explain its use.</p></details>`;
}
function mountMaker() {
  const form = document.getElementById("maker-record");
  const status = document.getElementById("maker-status");
  try {
    const saved = JSON.parse(localStorage.getItem(makerKey) || "{}");
    for (const field of form.querySelectorAll("[name]")) {
      if (typeof saved?.[field.name] === "string") field.value = saved[field.name];
    }
  } catch {
    status.textContent = "Saved data could not be loaded.";
  }
  function save() {
    try {
      localStorage.setItem(makerKey, JSON.stringify(Object.fromEntries(new FormData(form))));
      status.textContent = "Saved in this browser.";
    } catch {
      status.textContent = "Browser storage is unavailable. Keep a copy of your notes before leaving.";
    }
  }
  form.addEventListener("input", save);
  form.addEventListener("submit", event => { event.preventDefault(); save(); });
  document.getElementById("maker-print").onclick = () => {
    const record = [...new FormData(form)].map(([key, value]) => key.toUpperCase() + "\n" + value).join("\n\n");
    const url = URL.createObjectURL(new Blob(["SMARTSPACE PROJECT RECORD\n\n"+record], {type:"text/plain"}));
    const link = Object.assign(document.createElement("a"), {href:url, download:"smartspace-project-record.txt"});
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  document.getElementById("maker-print").textContent = "Download project notes";
}
