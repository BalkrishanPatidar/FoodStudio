(function () {
  const OPEN = 12 * 60 + 30;
  const CLOSE = 22 * 60 + 45;

  function lucknowMinutes(date) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date);
    const hour = Number(parts.find((part) => part.type === "hour").value);
    const minute = Number(parts.find((part) => part.type === "minute").value);
    return hour * 60 + minute;
  }

  function setOpenState() {
    const minutes = lucknowMinutes(new Date());
    const open = minutes >= OPEN && minutes < CLOSE;
    let label = "Open now";
    if (!open) {
      label = minutes < OPEN ? "Closed · opens at 12:30 PM" : "Closed · opens tomorrow at 12:30 PM";
    }
    document.querySelectorAll("[data-open-state]").forEach((node) => {
      node.textContent = label;
      node.classList.toggle("open", open);
      node.classList.toggle("closed", !open);
    });
  }

  const search = document.querySelector("#menu-search");
  const chips = Array.from(document.querySelectorAll("[data-filter]"));
  const dishes = Array.from(document.querySelectorAll(".dish"));
  const groups = Array.from(document.querySelectorAll(".menu-group"));
  const empty = document.querySelector("#menu-empty");
  const count = document.querySelector("#menu-count");
  let current = "all";

  function applyMenu() {
    const query = search.value.trim().toLowerCase();
    let shown = 0;
    dishes.forEach((dish) => {
      const group = dish.closest(".menu-group").dataset.group;
      const haystack = dish.dataset.hay;
      const visible = (current === "all" || current === group) && (!query || haystack.includes(query));
      dish.hidden = !visible;
      if (visible) shown += 1;
    });
    groups.forEach((group) => {
      group.hidden = !Array.from(group.querySelectorAll(".dish")).some((dish) => !dish.hidden);
    });
    empty.hidden = shown !== 0;
    count.textContent = shown + (shown === 1 ? " dish" : " dishes");
  }

  function selectChip(filter) {
    current = filter;
    chips.forEach((chip) => {
      chip.setAttribute("aria-pressed", chip.dataset.filter === filter ? "true" : "false");
    });
    applyMenu();
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => selectChip(chip.dataset.filter));
  });
  search.addEventListener("input", applyMenu);

  const params = new URLSearchParams(window.location.search);
  const requested = params.get("show");
  if (requested && chips.some((chip) => chip.dataset.filter === requested)) {
    selectChip(requested);
  }
  const find = params.get("find");
  if (find) {
    search.value = find;
    applyMenu();
  } else if (!requested) {
    applyMenu();
  }

  const dialog = document.querySelector("#lightbox");
  const dialogImage = dialog.querySelector("img");
  const dialogCaption = dialog.querySelector("p");
  document.querySelectorAll(".shot").forEach((button) => {
    button.addEventListener("click", () => {
      dialogImage.src = button.dataset.src;
      dialogImage.alt = button.dataset.alt;
      dialogCaption.textContent = button.dataset.alt;
      dialog.showModal();
    });
  });
  dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  const form = document.querySelector("#enquiry");
  const formError = document.querySelector("#form-error");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const guests = String(data.get("guests") || "").trim();
    const date = String(data.get("date") || "").trim();
    const time = String(data.get("time") || "").trim();
    const note = String(data.get("note") || "").trim();
    if (!name || !guests || !date || !time) {
      formError.textContent = "Add your name, the number of guests, a date and a time.";
      return;
    }
    formError.textContent = "";
    const message = [
      "Hello Ballu Da Dhaba, I would like to enquire about a table.",
      "",
      "Name: " + name,
      "Guests: " + guests,
      "Date: " + date,
      "Time: " + time,
      "Note: " + (note || "—")
    ].join("\n");
    window.location.href = "https://wa.me/917582863742?text=" + encodeURIComponent(message);
  });

  const dateInput = form.querySelector("[name=date]");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  dateInput.min = today;

  setOpenState();
})();
