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

const demoForm = document.querySelector("[data-demo-form]");
const formStatus = document.querySelector("[data-form-status]");

demoForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = demoForm.querySelector("button[type='submit']");
  const formData = new FormData(demoForm);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    association: formData.get("association"),
    memberCount: formData.get("memberCount"),
    needs: formData.get("needs"),
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
