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
const totalTourSeconds = 75;
let tourStartedAt = Date.now();
let tourElapsed = 0;
let tourPlaying = true;

const showTourSlide = (index) => {
  tourSlides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === index));
  tourDots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
};

const formatTourTime = (seconds) => {
  const rounded = Math.floor(seconds);
  return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`;
};

const updateTour = () => {
  if (!tourSlides.length) return;
  const elapsed = tourPlaying ? Math.min(totalTourSeconds, tourElapsed + (Date.now() - tourStartedAt) / 1000) : tourElapsed;
  const current = Math.min(tourSlides.length - 1, Math.floor((elapsed / totalTourSeconds) * tourSlides.length));
  showTourSlide(current);
  if (tourProgress) tourProgress.style.width = `${(elapsed / totalTourSeconds) * 100}%`;
  if (tourTime) tourTime.textContent = `${formatTourTime(elapsed)} / 01:15`;
  if (elapsed >= totalTourSeconds && tourPlaying) {
    tourElapsed = 0;
    tourStartedAt = Date.now();
  }
  requestAnimationFrame(updateTour);
};

tourPlay?.addEventListener("click", () => {
  if (tourPlaying) {
    tourElapsed = Math.min(totalTourSeconds, tourElapsed + (Date.now() - tourStartedAt) / 1000);
    tourPlaying = false;
  } else {
    tourStartedAt = Date.now();
    tourPlaying = true;
  }
  tourPlay.querySelector("span").textContent = tourPlaying ? "Ⅱ" : "▶";
  tourPlay.querySelector("b").textContent = tourPlaying ? "Pause" : "Reprendre";
  tourPlay.setAttribute("aria-label", tourPlaying ? "Mettre la visite en pause" : "Reprendre la visite");
});

tourDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    tourElapsed = (index / tourSlides.length) * totalTourSeconds;
    tourStartedAt = Date.now();
    showTourSlide(index);
  });
});

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  tourPlaying = false;
  tourPlay?.querySelector("span")?.replaceChildren("▶");
  if (tourPlay?.querySelector("b")) tourPlay.querySelector("b").textContent = "Lancer";
  tourPlay?.setAttribute("aria-label", "Lancer la visite");
}
updateTour();

const bookingDate = document.querySelector("[data-booking-date]");
if (bookingDate) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  bookingDate.min = tomorrow.toISOString().split("T")[0];
}

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
  } catch (error) {
    formStatus.classList.add("error");
    formStatus.textContent = error instanceof Error ? error.message : "Une erreur est survenue. Réessayez dans quelques instants.";
  } finally {
    submit.disabled = false;
    submit.textContent = "Envoyer ma demande";
  }
});
