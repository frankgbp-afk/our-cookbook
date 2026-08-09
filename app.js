let selectedCategory = "All";
let activeRecipeId = null;
let cookingStepIndex = 0;

const CATEGORY_ORDER = ["All", "Mains", "Sides", "Soups", "Desserts", "Drinks", "Breakfast", "Snacks"];
const CATEGORY_COLORS = {
  All: "#c95616",
  Mains: "#d97722",
  Sides: "#d96b2b",
  Soups: "#4f82a6",
  Desserts: "#9a62a0",
  Drinks: "#d99a2f",
  Breakfast: "#bd7b35",
  Snacks: "#77935e"
};

const homeView = document.getElementById("homeView");
const recipeView = document.getElementById("recipeView");
const cookingView = document.getElementById("cookingView");
const recipeGrid = document.getElementById("recipeGrid");
const recipeDetail = document.getElementById("recipeDetail");
const cookingContent = document.getElementById("cookingContent");
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.getElementById("categoryButtons");
const resultsTitle = document.getElementById("resultsTitle");
const recipeCount = document.getElementById("recipeCount");
const emptyState = document.getElementById("emptyState");
const backButton = document.getElementById("backButton");
const siteFooter = document.getElementById("siteFooter");
const hero = document.querySelector(".hero");

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryColor(category) {
  return CATEGORY_COLORS[category] || "#8f7867";
}

function setupCategories() {
  const existing = new Set(recipes.map(r => r.category).filter(Boolean));
  const categories = CATEGORY_ORDER.filter(c => c === "All" || existing.has(c) || ["Mains","Sides","Soups","Desserts","Drinks"].includes(c));

  categoryButtons.innerHTML = categories.map(category => `
    <button
      class="category-button ${category === selectedCategory ? "active" : ""}"
      data-category="${escapeHTML(category)}"
      style="--cat:${categoryColor(category)}"
      type="button">${escapeHTML(category)}</button>
  `).join("");

  categoryButtons.querySelectorAll(".category-button").forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      setupCategories();
      renderRecipes();
    });
  });
}

function filteredRecipes() {
  const query = searchInput.value.trim().toLowerCase();

  return recipes.filter(recipe => {
    const categoryMatch = selectedCategory === "All" || recipe.category === selectedCategory;
    const haystack = [
      recipe.name,
      recipe.category,
      recipe.description,
      ...(recipe.tags || []),
      ...(recipe.ingredients || [])
    ].join(" ").toLowerCase();

    return categoryMatch && (!query || haystack.includes(query));
  });
}

function renderRecipes() {
  const list = filteredRecipes();

  resultsTitle.textContent = selectedCategory === "All" ? "Featured Recipes" : selectedCategory;
  recipeCount.textContent = `${list.length} ${list.length === 1 ? "recipe" : "recipes"}`;
  emptyState.hidden = list.length !== 0;

  recipeGrid.innerHTML = list.map(recipe => `
    <article
      class="recipe-card"
      data-id="${escapeHTML(recipe.id)}"
      style="--cat:${categoryColor(recipe.category)}"
      tabindex="0"
      role="button"
      aria-label="Open ${escapeHTML(recipe.name)}">
      <div class="recipe-card-accent">
        <p class="recipe-category">${escapeHTML(recipe.category)}</p>
        <h3>${escapeHTML(recipe.name)}</h3>
        <p class="recipe-description">${escapeHTML(recipe.description || "")}</p>
      </div>
      <div class="recipe-card-footer">
        <div class="recipe-meta">
          <span>◷ ${escapeHTML(recipe.totalTime)}</span>
          <span>🍽 ${escapeHTML(recipe.servings)} servings</span>
        </div>
        <span class="view-recipe">View Recipe →</span>
      </div>
    </article>
  `).join("");

  recipeGrid.querySelectorAll(".recipe-card").forEach(card => {
    const open = () => openRecipe(card.dataset.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function recipeMarkup(recipe) {
  return `
    <div class="detail-hero" style="--cat:${categoryColor(recipe.category)}">
      <div class="detail-top">
        <p class="recipe-category">${escapeHTML(recipe.category)}</p>
        <h2>${escapeHTML(recipe.name)}</h2>
        <p class="detail-description">${escapeHTML(recipe.description || "")}</p>
        <button class="start-cooking-button" data-start-cooking="${escapeHTML(recipe.id)}" type="button">
          Start Cooking →
        </button>
      </div>
      <div class="detail-content">
        <div class="meta-grid">
          <div class="meta-box"><span>Prep</span><strong>${escapeHTML(recipe.prepTime)}</strong></div>
          <div class="meta-box"><span>Cook</span><strong>${escapeHTML(recipe.cookTime)}</strong></div>
          <div class="meta-box"><span>Total</span><strong>${escapeHTML(recipe.totalTime)}</strong></div>
          <div class="meta-box"><span>Servings</span><strong>${escapeHTML(recipe.servings)}</strong></div>
        </div>

        <div class="recipe-columns">
          <section>
            <h3>Ingredients</h3>
            <ul class="ingredients">
              ${(recipe.ingredients || []).map(item => `<li>${escapeHTML(item)}</li>`).join("")}
            </ul>
          </section>

          <section>
            <h3>Instructions</h3>
            <ol class="steps">
              ${(recipe.instructions || []).map(step => `<li>${escapeHTML(step)}</li>`).join("")}
            </ol>
          </section>
        </div>

        ${recipe.notes ? `<div class="notes"><strong>Notes</strong><br>${escapeHTML(recipe.notes)}</div>` : ""}
      </div>
    </div>
  `;
}

function openRecipe(id, updateHistory = true) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  activeRecipeId = id;
  recipeDetail.innerHTML = recipeMarkup(recipe);

  const startButton = recipeDetail.querySelector("[data-start-cooking]");
  if (startButton) {
    startButton.addEventListener("click", () => startCooking(id));
  }

  homeView.hidden = true;
  if (cookingView) cookingView.hidden = true;
  recipeView.hidden = false;
  hero.hidden = false;
  siteFooter.hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (updateHistory) history.pushState({ recipeId: id }, "", `#${id}`);
}

function showHome(updateHistory = true) {
  if (cookingView) cookingView.hidden = true;
  recipeView.hidden = true;
  homeView.hidden = false;
  hero.hidden = false;
  siteFooter.hidden = false;

  if (updateHistory) history.pushState({}, "", location.pathname);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startCooking(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe || !(recipe.instructions || []).length) return;

  activeRecipeId = id;
  cookingStepIndex = 0;

  homeView.hidden = true;
  recipeView.hidden = true;
  if (!cookingView) return;
  cookingView.hidden = false;
  hero.hidden = true;
  siteFooter.hidden = true;

  renderCookingStep();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCookingStep() {
  const recipe = recipes.find(r => r.id === activeRecipeId);
  if (!recipe) return;

  const steps = recipe.instructions || [];
  const finished = cookingStepIndex >= steps.length;
  const progress = finished ? 100 : ((cookingStepIndex + 1) / steps.length) * 100;

  cookingContent.innerHTML = `
    <div class="cook-shell" style="--cat:${categoryColor(recipe.category)}">
      <div class="cook-topbar">
        <button class="cook-exit" id="cookExit" type="button">← Full Recipe</button>
        <span class="cook-progress-label">
          ${finished ? "Done" : `Step ${cookingStepIndex + 1} of ${steps.length}`}
        </span>
      </div>

      <div class="cook-progress-track" aria-hidden="true">
        <div class="cook-progress-fill" style="width:${progress}%"></div>
      </div>

      <div class="cook-card ${finished ? "cook-finished" : ""}">
        <p class="cook-recipe-name">${escapeHTML(recipe.name)}</p>
        ${
          finished
            ? `<p class="cook-step-text">All done. Enjoy your food. 🍽️</p>`
            : `
              <p class="cook-step-number">Step ${cookingStepIndex + 1}</p>
              <p class="cook-step-text">${escapeHTML(steps[cookingStepIndex])}</p>
            `
        }
      </div>

      <div class="cook-controls">
        <button class="cook-button secondary" id="cookBack" type="button"
          ${cookingStepIndex === 0 ? "disabled" : ""}>
          ← Back
        </button>
        <button class="cook-button primary" id="cookNext" type="button">
          ${finished ? "Back to Recipe" : cookingStepIndex === steps.length - 1 ? "Finish ✓" : "Next →"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("cookExit").addEventListener("click", () => openRecipe(activeRecipeId, false));

  document.getElementById("cookBack").addEventListener("click", () => {
    if (cookingStepIndex > 0) {
      cookingStepIndex -= 1;
      renderCookingStep();
    }
  });

  document.getElementById("cookNext").addEventListener("click", () => {
    if (finished) {
      openRecipe(activeRecipeId, false);
      return;
    }

    cookingStepIndex += 1;
    renderCookingStep();
  });
}

backButton.addEventListener("click", () => showHome());
searchInput.addEventListener("input", renderRecipes);

window.addEventListener("popstate", () => {
  const id = location.hash.slice(1);
  if (id && recipes.some(r => r.id === id)) {
    openRecipe(id, false);
  } else {
    showHome(false);
  }
});

setupCategories();
renderRecipes();

const initialId = location.hash.slice(1);
if (initialId && recipes.some(r => r.id === initialId)) {
  openRecipe(initialId, false);
}
