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

const AUTHOR_COLORS = {
  Frank: "#4C7A4D",
  Beth: "#7FB7D6",
  Ann: "#8E6BBE",
  Kate: "#E0B43D",
  Mom: "#C46F8A",
  Alan: "#5F8F8A",
  Eric: "#B8754A"
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

function authorColor(author) {
  return AUTHOR_COLORS[author] || "#8f7867";
}

function categoryColor(category) {
  return CATEGORY_COLORS[category] || "#8f7867";
}

function setupCategories() {
  const existing = new Set(recipes.map(r => r.category).filter(Boolean));
  const categories = CATEGORY_ORDER.filter(c => c === "All" || existing.has(c) || ["Mains","Sides","Soups","Desserts","Drinks","Snacks"].includes(c));

  categoryButtons.innerHTML = categories.map(category => `
    <button
      class="category-button ${category === selectedCategory ? "active" : ""}"
      data-category="${escapeHTML(category)}"
      style="--cat:${categoryColor(category)}"
      type="button">${escapeHTML(category)}</button>
  `).join("");


}

function parseMixedNumber(text) {
  const value = String(text).trim();
  if (/^\d+\s+\d+\/\d+$/.test(value)) {
    const [whole, fraction] = value.split(/\s+/);
    const [n, d] = fraction.split("/").map(Number);
    return Number(whole) + n / d;
  }
  if (/^\d+\/\d+$/.test(value)) {
    const [n, d] = value.split("/").map(Number);
    return n / d;
  }
  if (/^\d+(\.\d+)?$/.test(value)) return Number(value);
  return null;
}

// Keep useful kitchen fractions (including thirds and sixths) when scaling.
function prettyQuantity(value) {
  const whole = Math.floor(value + 1e-9);
  const fraction = value - whole;
  let best = { n: 0, d: 1, error: Infinity };
  for (const d of [1, 2, 3, 4, 6, 8, 12, 16, 24, 32]) {
    const n = Math.round(fraction * d);
    const error = Math.abs(fraction - n / d);
    if (error < best.error - 1e-10) best = { n, d, error };
  }
  const integer = whole + Math.floor(best.n / best.d);
  const numerator = best.n % best.d;
  if (!numerator) return String(integer);
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const divisor = gcd(numerator, best.d);
  const text = (numerator / divisor) + "/" + (best.d / divisor);
  return integer ? integer + " " + text : text;
}

function scaleIngredient(ingredient, factor) {
  if (!Number.isFinite(factor) || factor <= 0 || factor === 1) return ingredient;

  // Scale both sides of ranges such as 1/2–1 pound, 1-3 cloves and 1/4 to 1/3 cup.
  const number = "(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:\\.\\d+)?)";
  const match = ingredient.match(new RegExp(
    "^(\\s*)(" + number + ")(\\s*(?:–|—|-|to)\\s*(" + number + "))?(?=\\s|[A-Za-z(]|$)", "i"
  ));
  if (!match) return ingredient;

  const first = parseMixedNumber(match[2]);
  const second = match[4] ? parseMixedNumber(match[4]) : null;
  if (first === null || (match[4] && second === null)) return ingredient;
  const prefix = match[1] + prettyQuantity(first * factor);
  const range = match[3] ? match[3].replace(match[4], prettyQuantity(second * factor)) : "";
  let remainder = ingredient.slice(match[0].length);

  // Update metric equivalents, but not fixed package sizes such as (8 oz) blocks.
  remainder = remainder.replace(
    /^(\s+(?:cups?|tbsps?|tablespoons?|tsps?|teaspoons?|lbs?|pounds?|ounces?|oz|grams?|g|ml|liters?|l)\s+\((?:about\s+)?)(\d+(?:\.\d+)?)(\s*(?:g|grams?|ml)\))/i,
    (_, before, amount, after) => before + Math.round(Number(amount) * factor) + after
  );
  return prefix + range + remainder;
}

function servingInfo(recipe) {
  const numeric = Number(recipe.servings);
  if (Number.isFinite(numeric) && numeric > 0) {
    return { mode: "servings", base: numeric, current: numeric, factor: 1 };
  }
  return { mode: "batch", base: 1, current: 1, factor: 1 };
}

function renderIngredientList(recipe, factor = 1) {
  return (recipe.ingredients || [])
    .map(item => `<li>${escapeHTML(scaleIngredient(item, factor))}</li>`)
    .join("");
}

function servingControlMarkup(recipe) {
  const info = servingInfo(recipe);
  if (info.mode === "servings") {
    return `
      <div class="serving-adjuster" data-serving-mode="servings" data-base="${info.base}">
        <span class="serving-label">Servings</span>
        <div class="serving-stepper">
          <button class="serving-button" data-serving-action="down" type="button" aria-label="Decrease servings">−</button>
          <strong class="serving-value">${info.current}</strong>
          <button class="serving-button" data-serving-action="up" type="button" aria-label="Increase servings">+</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="serving-adjuster" data-serving-mode="batch" data-base="1">
      <span class="serving-label">Batch size</span>
      <div class="serving-stepper">
        <button class="serving-button" data-serving-action="down" type="button" aria-label="Decrease batch size">−</button>
        <strong class="serving-value">1×</strong>
        <button class="serving-button" data-serving-action="up" type="button" aria-label="Increase batch size">+</button>
      </div>
    </div>
  `;
}

function attachServingControls(recipe) {
  const adjuster = recipeDetail.querySelector(".serving-adjuster");
  const ingredientList = recipeDetail.querySelector(".ingredients");
  if (!adjuster || !ingredientList) return;

  const mode = adjuster.dataset.servingMode;
  const base = Number(adjuster.dataset.base) || 1;
  let current = base;

  const valueEl = adjuster.querySelector(".serving-value");
  const down = adjuster.querySelector('[data-serving-action="down"]');
  const up = adjuster.querySelector('[data-serving-action="up"]');

  function update() {
    let factor;
    if (mode === "servings") {
      current = Math.max(1, Math.round(current));
      factor = current / base;
      valueEl.textContent = String(current);
      down.disabled = current <= 1;
    } else {
      current = Math.max(0.5, Math.round(current * 2) / 2);
      factor = current;
      valueEl.textContent = `${current}×`;
      down.disabled = current <= 0.5;
    }
    ingredientList.innerHTML = renderIngredientList(recipe, factor);
  }

  down.addEventListener("click", () => {
    current -= mode === "servings" ? 1 : 0.5;
    update();
  });

  up.addEventListener("click", () => {
    current += mode === "servings" ? 1 : 0.5;
    update();
  });

  update();
}


function recipeMarkup(recipe) {
  return `
    <div class="detail-hero" style="--cat:${categoryColor(recipe.category)}">
      ${recipe.image ? `<img class="detail-photo" src="${escapeHTML(recipe.image)}" alt="${escapeHTML(recipe.name)}" />` : ""}
      <div class="detail-top">
        ${authorBadgeMarkup(recipe)}
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
            ${servingControlMarkup(recipe)}
            <ul class="ingredients">
              ${renderIngredientList(recipe, 1)}
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
  attachServingControls(recipe);

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

  if (updateHistory) history.pushState({}, "", location.pathname + location.search);
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

// The browse page and URL routing are initialized by redesign.js.
setupCategories();
