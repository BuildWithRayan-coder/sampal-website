// Sampal - Minimalist Website Client Logic
document.addEventListener("DOMContentLoaded", () => {
  // FAQ Accordion Interactivity
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".faq-question");
    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close other open items for a neat accordion flow
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove("active");
          const btn = other.querySelector(".faq-question");
          if (btn) btn.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove("active");
        questionBtn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        questionBtn.setAttribute("aria-expanded", "true");
      }
    });
  });
});
