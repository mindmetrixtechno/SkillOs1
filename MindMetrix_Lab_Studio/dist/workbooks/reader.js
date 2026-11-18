function mountWorkbook(container) {
  if (!container) return;
  const books = window.skillOSWorkbooks?.[container.dataset.grade] ?? [];
  if (!books.length) {
    container.textContent = "No workbook has been configured for this grade.";
    return;
  }
  container.innerHTML = '<label>Workbook <select></select></label><p><button data-turn="-1">Previous page</button> <span role="status"></span> <button data-turn="1">Next page</button></p><button data-open>Open full-screen reader</button><img draggable="false"><dialog class="workbook-full"><div class="reader-toolbar"><strong>View only</strong><button data-turn="-1">Previous page</button><span role="status"></span><button data-turn="1">Next page</button><label>Zoom <select data-zoom><option value="fit">Fit width</option><option value="100">100%</option><option value="150">150%</option><option value="200">200%</option></select></label><button data-close>Close reader</button></div><div class="reader-scroll"><img draggable="false"></div></dialog>';
  const picker = container.querySelector("label select");
  books.forEach((book, index) => picker.add(new Option(book.title, index)));
  const images = [...container.querySelectorAll("img")];
  const statuses = [...container.querySelectorAll("[role=status]")];
  const buttons = [...container.querySelectorAll("[data-turn]")];
  const dialog = container.querySelector("dialog");
  const zoom = dialog.querySelector("[data-zoom]");
  const scroll = dialog.querySelector(".reader-scroll");
  let page = 0;
  function display() {
    const book = books[Number(picker.value)];
    images.forEach(image => {
      image.src = book.pages[page];
      image.alt = book.title + ", page " + (page + 1);
    });
    statuses.forEach(status => status.textContent = "Page " + (page + 1) + " of " + book.pages.length);
    buttons.forEach(button => {
      button.disabled = Number(button.dataset.turn) < 0 ? page === 0 : page >= book.pages.length - 1;
    });
    scroll.scrollTo(0, 0);
  }
  container.querySelector("[data-open]").onclick = () => {
    dialog.showModal();
    dialog.requestFullscreen?.()?.catch(() => {});
  };
  dialog.querySelector("[data-close]").onclick = () => dialog.close();
  dialog.addEventListener("close", () => {
    if (document.fullscreenElement === dialog) document.exitFullscreen().catch(() => {});
  });
  zoom.onchange = () => {
    images[1].style.width = zoom.value === "fit" ? "" : zoom.value + "%";
  };
  picker.onchange = () => { page = 0; display(); };
  buttons.forEach(button => button.onclick = () => { page += Number(button.dataset.turn); display(); });
  container.addEventListener("contextmenu", event => event.preventDefault());
  display();
}
