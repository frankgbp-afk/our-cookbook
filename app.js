let selectedCategory = "All";

const homeView = document.getElementById("homeView");
const recipeView = document.getElementById("recipeView");
const recipeGrid = document.getElementById("recipeGrid");
const recipeDetail = document.getElementById("recipeDetail");
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.getElementById("categoryButtons");
const resultsTitle = document.getElementById("resultsTitle");
const recipeCount = document.getElementById("recipeCount");
const emptyState = document.getElementById("emptyState");
const backButton = document.getElementById("backButton");

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imageFor(recipe) {
  if (recipe.image) return escapeHTML(recipe.image);
  const label = encodeURIComponent(recipe.name);
  return `https://placehold.co/1200x675/f0e4d3/5b4937?text=${label}`;
}

function setupCategories() {
  const categories = ["All", ...new Set(recipes.map(r => r.category).filter(Boolean))];
  categoryButtons.innerHTML = categories.map(category => `
    <button class="category-button ${category === selectedCategory ? "active" : ""}"
      data-category="${escapeHTML(category)}" type="button">${escapeHTML(category)}</button>
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

  resultsTitle.textContent = selectedCategory === "All" ? "All Recipes" : selectedCategory;
  recipeCount.textContent = `${list.length} ${list.length === 1 ? "recipe" : "recipes"}`;
  emptyState.hidden = list.length !== 0;

  recipeGrid.innerHTML = list.map(recipe => `
    <article class="recipe-card" data-id="${escapeHTML(recipe.id)}" tabindex="0" role="button"
      aria-label="Open ${escapeHTML(recipe.name)}">
      <img class="recipe-image" src="${imageFor(recipe)}" alt="${escapeHTML(recipe.name)}" />
      <div class="recipe-card-body">
        <p class="recipe-category">${escapeHTML(recipe.category)}</p>
        <h3>${escapeHTML(recipe.name)}</h3>
        <div class="recipe-meta">
          <span>⏱ ${escapeHTML(recipe.totalTime)}</span>
          <span>🍽 ${escapeHTML(recipe.servings)} servings</span>
        </div>
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

function openRecipe(id) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe) return;

  recipeDetail.innerHTML = `
    <div class="detail-hero">
      <img class="detail-image" src="${imageFor(recipe)}" alt="${escapeHTML(recipe.name)}" />
      <div class="detail-content">
        <p class="recipe-category">${escapeHTML(recipe.category)}</p>
        <h2>${escapeHTML(recipe.name)}</h2>
        <p class="detail-description">${escapeHTML(recipe.description)}</p>

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

  homeView.hidden = true;
  recipeView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });

  history.pushState({ recipeId: id }, "", `#${id}`);
}

function showHome(updateHistory = true) {
  recipeView.hidden = true;
  homeView.hidden = false;
  if (updateHistory) history.pushState({}, "", location.pathname);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

backButton.addEventListener("click", () => showHome());
searchInput.addEventListener("input", renderRecipes);

window.addEventListener("popstate", () => {
  const id = location.hash.slice(1);
  if (id && recipes.some(r => r.id === id)) {
    openRecipeWithoutHistory(id);
  } else {
    recipeView.hidden = true;
    homeView.hidden = false;
  }
});

function openRecipeWithoutHistory(id) {
  const originalPushState = history.pushState;
  history.pushState = () => {};
  openRecipe(id);
  history.pushState = originalPushState;
}

setupCategories();
renderRecipes();

const initialId = location.hash.slice(1);
if (initialId && recipes.some(r => r.id === initialId)) {
  openRecipeWithoutHistory(initialId);
}
