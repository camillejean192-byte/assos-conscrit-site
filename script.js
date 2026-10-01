const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton?.addEventListener("click", () => {
  const open = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.1 }
);
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

document.querySelectorAll("[data-billing]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-billing]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const billing = button.dataset.billing;
    document.querySelectorAll(".price b[data-monthly]").forEach((price) => {
      price.textContent = price.dataset[billing];
    });
  });
});

const roiMembers = document.querySelector("[data-roi-members]");
const roiHours = document.querySelector("[data-roi-hours]");
const roiRate = document.querySelector("[data-roi-rate]");

const updateRoi = () => {
  if (!roiMembers || !roiHours || !roiRate) return;
  const members = Number(roiMembers.value);
  const hours = Number(roiHours.value);
  const rate = Number(roiRate.value);
  const efficiency = Math.min(0.35, 0.2 + members / 6500);
  const savedHours = Math.round(hours * 4.33 * efficiency);
  const savedValue = savedHours * rate;
  const savedDays = Math.max(1, Math.round((savedHours * 12) / 8));

  document.querySelector("[data-roi-members-value]").textContent = members.toLocaleString("fr-FR");
  document.querySelector("[data-roi-hours-value]").textContent = `${hours} h`;
  document.querySelector("[data-roi-rate-value]").textContent = `${rate} €`;
  document.querySelector("[data-roi-saved]").textContent = `${savedHours} h / mois`;
  document.querySelector("[data-roi-value]").textContent = `${savedValue.toLocaleString("fr-FR")} € / mois`;
  document.querySelector("[data-roi-days]").textContent = `${savedDays} jours`;
};

[roiMembers, roiHours, roiRate].forEach((input) => input?.addEventListener("input", updateRoi));
updateRoi();

const tourSlides = [...document.querySelectorAll("[data-tour-slide]")];
const tourDots = [...document.querySelectorAll("[data-tour-dot]")];
const tourPlay = document.querySelector("[data-tour-play]");
const tourProgress = document.querySelector("[data-tour-progress]");
const tourTime = document.querySelector("[data-tour-time]");
const totalTourSeconds = 32;
const tourSection = document.querySelector(".tour-section");
let tourStartedAt = 0;
let tourElapsed = 0;
let tourPlaying = false;
let activeTourSlide = 0;

const showTourSlide = (index) => {
  activeTourSlide = index;
  tourSlides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === index));
  tourDots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
  const step = document.querySelector("[data-tour-step]");
  if (step) step.textContent = `Étape ${index + 1}/${tourSlides.length}`;
};

const formatTourTime = (seconds) => {
  const rounded = Math.floor(seconds);
  return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`;
};

const updateTour = () => {
  if (!tourSlides.length) return;
  const elapsed = tourPlaying ? Math.min(totalTourSeconds, tourElapsed + (Date.now() - tourStartedAt) / 1000) : tourElapsed;
  const current = Math.min(tourSlides.length - 1, Math.floor((elapsed / totalTourSeconds) * tourSlides.length));
  if (current !== activeTourSlide) showTourSlide(current);
  if (tourProgress) tourProgress.style.width = `${(elapsed / totalTourSeconds) * 100}%`;
  if (tourTime) tourTime.textContent = `${formatTourTime(elapsed)} / 00:32`;
  if (elapsed >= totalTourSeconds && tourPlaying) {
    tourElapsed = totalTourSeconds;
    tourPlaying = false;
    tourSection?.classList.remove("is-playing");
    tourPlay?.querySelector("span")?.replaceChildren("↻");
    if (tourPlay?.querySelector("b")) tourPlay.querySelector("b").textContent = "Revoir";
    tourPlay?.setAttribute("aria-label", "Revoir la visite");
  }
  requestAnimationFrame(updateTour);
};

tourPlay?.addEventListener("click", () => {
  if (tourPlaying) {
    tourElapsed = Math.min(totalTourSeconds, tourElapsed + (Date.now() - tourStartedAt) / 1000);
    tourPlaying = false;
  } else {
    if (tourElapsed >= totalTourSeconds) {
      tourElapsed = 0;
      showTourSlide(0);
    }
    tourStartedAt = Date.now();
    tourPlaying = true;
  }
  tourSection?.classList.toggle("is-playing", tourPlaying);
  tourPlay.querySelector("span").textContent = tourPlaying ? "Ⅱ" : "▶";
  tourPlay.querySelector("b").textContent = tourPlaying ? "Pause" : "Reprendre";
  tourPlay.setAttribute("aria-label", tourPlaying ? "Mettre la visite en pause" : "Reprendre la visite");
});

tourDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    tourElapsed = (index / tourSlides.length) * totalTourSeconds;
    if (tourPlaying) tourStartedAt = Date.now();
    showTourSlide(index);
    if (tourProgress) tourProgress.style.width = `${(tourElapsed / totalTourSeconds) * 100}%`;
    if (tourTime) tourTime.textContent = `${formatTourTime(tourElapsed)} / 00:32`;
  });
});

showTourSlide(0);
updateTour();

const bookingDate = document.querySelector("[data-booking-date]");
const bookingSlot = document.querySelector("[data-booking-slot]");
const bookingDays = document.querySelector("[data-booking-days]");
const bookingSlotButtons = [...document.querySelectorAll("[data-slot]")];

if (bookingDate && bookingDays) {
  const dates = [];
  const cursor = new Date();
  while (dates.length < 8) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) dates.push(new Date(cursor));
  }
  dates.forEach((date, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.date = date.toISOString().split("T")[0];
    button.innerHTML = `<span>${date.toLocaleDateString("fr-FR", { weekday: "short" })}</span><b>${date.getDate()}</b><span>${date.toLocaleDateString("fr-FR", { month: "short" })}</span>`;
    if (index === 0) {
      button.classList.add("active");
      bookingDate.value = button.dataset.date;
    }
    button.addEventListener("click", () => {
      bookingDays.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      bookingDate.value = button.dataset.date;
    });
    bookingDays.append(button);
  });
}

if (bookingSlot && bookingSlotButtons.length) {
  bookingSlotButtons[0].classList.add("active");
  bookingSlot.value = bookingSlotButtons[0].dataset.slot;
  bookingSlotButtons.forEach((button) => button.addEventListener("click", () => {
    bookingSlotButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    bookingSlot.value = button.dataset.slot;
  }));
}

const roleContent = {
  presidence: ["PARCOURS PRÉSIDENCE", "Décider avec une information à jour.", "Consultez les indicateurs du bureau, vérifiez les actions récentes et gardez une vue d’ensemble sans demander plusieurs fichiers.", ["Tableau de bord de l’association", "Journal des actions importantes", "Accès maîtrisés pour chaque personne"]],
  tresorerie: ["PARCOURS TRÉSORERIE", "Expliquer chaque mouvement rapidement.", "Enregistrez les recettes et dépenses, rattachez les justificatifs et préparez l’export comptable depuis la même vue.", ["Totaux mis à jour automatiquement", "Notes de frais reliées aux remboursements", "Exports CSV et récapitulatifs PDF"]],
  secretariat: ["PARCOURS SECRÉTARIAT", "Garder un annuaire vraiment utile.", "Centralisez les coordonnées, les rôles, les adhésions signées et les documents dont le bureau a besoin.", ["Import et recherche rapide", "Suivi des signatures", "Bibliothèque de documents partagés"]],
  membre: ["PARCOURS MEMBRE", "Participer sans apprendre un logiciel compliqué.", "Retrouvez les informations autorisées, échangez avec le bureau et transmettez une note de frais depuis le téléphone.", ["Accès limité au nécessaire", "Notifications utiles", "Utilisation sur mobile et ordinateur"]],
};

document.querySelectorAll("[data-role-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-role-tab]").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  const content = roleContent[button.dataset.roleTab];
  const panel = document.querySelector("[data-role-detail]");
  if (content && panel) {
    panel.querySelector("span").textContent = content[0];
    panel.querySelector("h3").textContent = content[1];
    panel.querySelector("p").textContent = content[2];
    panel.querySelector("ul").innerHTML = content[3].map((item) => `<li>${item}</li>`).join("");
    trackMarketing("role_explored", button.dataset.roleTab);
  }
}));

const planRecommender = document.querySelector("[data-plan-recommender]");
const planResult = document.querySelector("[data-plan-result]");
const updatePlan = () => {
  if (!planRecommender || !planResult) return;
  const values = new FormData(planRecommender);
  let plan = values.get("size");
  if (values.get("support") === "yes") plan = "pro";
  if (values.get("billing") === "yes" && plan === "starter") plan = "association";
  const plans = {
    starter: ["Starter · 19 € / mois", "L’essentiel pour centraliser les membres, la trésorerie et les documents."],
    association: ["Association · 39 € / mois", "La formule complète pour centraliser la gestion du bureau."],
    pro: ["Pro · 69 € / mois", "Le suivi renforcé pour les structures plus grandes ou exigeantes."],
  };
  planResult.querySelector("strong").textContent = plans[plan][0];
  planResult.querySelector("p").textContent = plans[plan][1];
};
planRecommender?.querySelectorAll("select").forEach((select) => select.addEventListener("change", updatePlan));
updatePlan();

const formNext = document.querySelector("[data-form-next]");
const formBack = document.querySelector("[data-form-back]");
const formStepLabel = document.querySelector("[data-form-step-label]");
const showFormStep = (step) => {
  document.querySelectorAll("[data-form-step]").forEach((panel) => {
    const active = panel.dataset.formStep === String(step);
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  if (formStepLabel) formStepLabel.textContent = `Étape ${step} sur 2`;
};
formNext?.addEventListener("click", () => {
  const fields = [...document.querySelectorAll('[data-form-step="1"] input[required]')];
  const invalid = fields.find((field) => !field.checkValidity());
  if (invalid) return invalid.reportValidity();
  showFormStep(2);
  trackMarketing("booking_started", "form_step_2");
});
formBack?.addEventListener("click", () => showFormStep(1));

function trackMarketing(event, label = "") {
  window.va = window.va || function (...args) {
    window.vaq = window.vaq || [];
    window.vaq.push(args);
  };
  window.va("event", event, { label });
  fetch("https://facture-freelance.vercel.app/api/marketing-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, label, path: window.location.pathname }),
    keepalive: true,
  }).catch(() => {});
}

document.querySelectorAll("[data-track]").forEach((element) => element.addEventListener("click", () => trackMarketing(element.dataset.track, element.textContent.trim().slice(0, 80))));
document.querySelectorAll('.price-card .button').forEach((element) => element.addEventListener("click", () => trackMarketing("pricing_plan", element.closest(".price-card")?.querySelector(".plan")?.textContent || "")));
document.querySelectorAll('a[href*="/demo"]').forEach((element) => element.addEventListener("click", () => trackMarketing("cta_demo", element.textContent.trim().slice(0, 80))));

const guideForm = document.querySelector("[data-guide-form]");
guideForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = new FormData(guideForm).get("email");
  const status = guideForm.querySelector("[data-guide-status]");
  const button = guideForm.querySelector("button");
  button.disabled = true;
  button.textContent = "Préparation…";
  try {
    const response = await fetch("https://facture-freelance.vercel.app/api/demo-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "Lecteur du guide", email, association: "Guide passation", memberCount: "", needs: "Téléchargement du guide de passation", website: "", consent: true }) });
    if (!response.ok) throw new Error("Impossible d’envoyer le guide.");
    status.textContent = "Le guide est prêt. Le téléchargement démarre.";
    trackMarketing("guide_download", "guide_passation");
    const link = document.createElement("a");
    link.href = "/assets/guide-passation-bureau.pdf";
    link.download = "guide-passation-bureau-associatif.pdf";
    link.click();
    guideForm.reset();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Une erreur est survenue.";
  } finally {
    button.disabled = false;
    button.textContent = "Recevoir et télécharger";
  }
});

const chatPanel = document.querySelector("[data-chat-panel]");
document.querySelectorAll("[data-chat-toggle]").forEach((button) => button.addEventListener("click", () => {
  if (!chatPanel) return;
  chatPanel.hidden = !chatPanel.hidden;
  document.querySelector(".chat-launcher")?.setAttribute("aria-expanded", String(!chatPanel.hidden));
}));
const chatAnswers = {
  price: "Les formules de lancement vont de 19 à 69 € par mois, sans prix par utilisateur.",
  data: "Oui. L’annuaire et les données comptables disposent d’exports dans des formats courants.",
  setup: "Le programme pilote comprend l’import de l’annuaire et une session de prise en main.",
  cancel: "Les formules mensuelles sont prévues sans engagement. Les modalités exactes figurent dans les CGV.",
};
document.querySelectorAll("[data-chat-question]").forEach((button) => button.addEventListener("click", () => {
  const answer = document.querySelector("[data-chat-answer]");
  if (answer) answer.textContent = chatAnswers[button.dataset.chatQuestion];
}));

const demoForm = document.querySelector("[data-demo-form]");
const formStatus = document.querySelector("[data-form-status]");

demoForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = demoForm.querySelector("button[type='submit']");
  const formData = new FormData(demoForm);
  const bookingDetails = [
    formData.get("preferredDate") ? `Date souhaitée : ${formData.get("preferredDate")}` : "",
    formData.get("preferredSlot") ? `Créneau préféré : ${formData.get("preferredSlot")}` : "",
  ].filter(Boolean).join(" · ");
  const expressedNeeds = String(formData.get("needs") || "").trim();
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    association: formData.get("association"),
    memberCount: formData.get("memberCount"),
    needs: [expressedNeeds, bookingDetails].filter(Boolean).join("\n"),
    website: formData.get("website"),
    consent: formData.get("consent") === "on",
  };

  submit.disabled = true;
  submit.textContent = "Envoi en cours…";
  formStatus.className = "form-status";
  formStatus.textContent = "";

  try {
    const response = await fetch("https://facture-freelance.vercel.app/api/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Impossible d’envoyer la demande.");
    demoForm.reset();
    formStatus.classList.add("success");
    formStatus.textContent = result.message;
    trackMarketing("booking_completed", bookingDetails || "sans_creneau");
    const selectedDate = formData.get("preferredDate");
    const selectedSlot = formData.get("preferredSlot");
    if (selectedDate && selectedSlot) {
      const dateCompact = String(selectedDate).replaceAll("-", "");
      const timeCompact = String(selectedSlot).replace(":", "");
      const end = new Date(`${selectedDate}T${selectedSlot}:00`);
      end.setMinutes(end.getMinutes() + 30);
      const endCompact = `${String(end.getHours()).padStart(2, "0")}${String(end.getMinutes()).padStart(2, "0")}`;
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("Présentation Assos Conscrit")}&dates=${dateCompact}T${timeCompact}00/${dateCompact}T${endCompact}00&details=${encodeURIComponent("Créneau demandé. La confirmation définitive sera envoyée par Assos Conscrit.")}`;
      formStatus.innerHTML = `${result.message}<br><a href="${calendarUrl}" target="_blank" rel="noopener">Ajouter le créneau à Google Agenda</a>`;
    }
  } catch (error) {
    formStatus.classList.add("error");
    formStatus.textContent = error instanceof Error ? error.message : "Une erreur est survenue. Réessayez dans quelques instants.";
  } finally {
    submit.disabled = false;
    submit.textContent = "Confirmer ma demande";
  }
});
