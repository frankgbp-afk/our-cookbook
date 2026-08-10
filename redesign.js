let selectedAuthor = null;
let homeExpanded = false;

const globalHomeButton = document.getElementById("globalHomeButton");
const browseActions = document.getElementById("browseActions");
const viewAllButton = document.getElementById("viewAllButton");
const wantToTryButton = document.getElementById("wantToTryButton");
const wantToTryView = document.getElementById("wantToTryView");

const originalOpenRecipe = openRecipe;
const originalShowHome = showHome;
const originalStartCooking = startCooking;

function setHomeButtonVisible(visible) {
  if (globalHomeButton) globalHomeButton.hidden = !visible;
}

function setBrowseActionsVisible(visible) {
  if (browseActions) browseActions.hidden = !visible;
}

function attachAuthorBadgeHandlers(root = document) {
  root.querySelectorAll(".author-badge[data-author]").forEach(badge => {
    if (badge.dataset.ready === "true") return;
    badge.dataset.ready = "true";
    badge.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      selectedAuthor = badge.dataset.author || null;
      selectedCategory = "All";
      homeExpanded = true;
      searchInput.value = "";
      setupCategories();
      showHome(false);
      renderRecipes();
      history.pushState({ author: selectedAuthor }, "", `#author-${encodeURIComponent(selectedAuthor)}`);
    });
  });
}

authorBadgeMarkup = function(recipe) {
  if (!recipe.author) return "";
  return `
    <button class="author-badge" data-author="${escapeHTML(recipe.author)}" style="--author:${authorColor(recipe.author)}" type="button" aria-label="Show recipes from ${escapeHTML(recipe.author)}">
      <span class="author-icon" aria-hidden="true">🍴</span>
      <span>${escapeHTML(recipe.author)}</span>
    </button>
  `;
};

filteredRecipes = function() {
  const query = searchInput.value.trim().toLowerCase();

  return recipes.filter(recipe => {
    const categoryMatch = selectedCategory === "All" || recipe.category === selectedCategory;
    const authorMatch = !selectedAuthor || recipe.author === selectedAuthor;
    const haystack = [
      recipe.name,
      recipe.category,
      recipe.author,
      recipe.description,
      ...(recipe.tags || []),
      ...(recipe.ingredients || [])
    ].filter(Boolean).join(" ").toLowerCase();

    return categoryMatch && authorMatch && (!query || haystack.includes(query));
  });
};

renderRecipes = function() {
  const allMatches = filteredRecipes();
  const query = searchInput.value.trim();
  const isPristineHome = !homeExpanded && selectedCategory === "All" && !selectedAuthor && !query;
  const list = isPristineHome ? [...allMatches].slice(-8).reverse() : allMatches;

  if (selectedAuthor) {
    resultsTitle.textContent = `Recipes from ${selectedAuthor}`;
  } else if (query) {
    resultsTitle.textContent = "Search Results";
  } else if (selectedCategory !== "All") {
    resultsTitle.textContent = selectedCategory;
  } else if (homeExpanded) {
    resultsTitle.textContent = "All Recipes";
  } else {
    resultsTitle.textContent = "Recently Added";
  }

  recipeCount.textContent = isPristineHome
    ? `${allMatches.length} total`
    : `${list.length} ${list.length === 1 ? "recipe" : "recipes"}`;
  emptyState.hidden = list.length !== 0;

  recipeGrid.innerHTML = list.map(recipe => `
    <article
      class="recipe-card"
      data-id="${escapeHTML(recipe.id)}"
      style="--cat:${categoryColor(recipe.category)}"
      tabindex="0"
      role="button"
      aria-label="Open ${escapeHTML(recipe.name)}">
      <div class="recipe-card-media">
        ${recipe.image ? `<img class="recipe-card-photo" src="${escapeHTML(recipe.image)}" alt="${escapeHTML(recipe.name)}" loading="lazy" />` : `<div class="recipe-card-placeholder" aria-hidden="true">🍴</div>`}
      </div>
      <div class="recipe-card-content">
        ${authorBadgeMarkup(recipe)}
        <p class="recipe-category">${escapeHTML(recipe.category)}</p>
        <h3>${escapeHTML(recipe.name)}</h3>
        <p class="recipe-description">${escapeHTML(recipe.description || "")}</p>
        <div class="recipe-card-bottom">
          <div class="recipe-meta">
            <span>◷ ${escapeHTML(recipe.totalTime)}</span>
          </div>
          <span class="view-recipe" aria-hidden="true">View Recipe →</span>
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

  attachAuthorBadgeHandlers(recipeGrid);
  setBrowseActionsVisible(true);
  if (viewAllButton) viewAllButton.hidden = !isPristineHome;
};

openRecipe = function(id, updateHistory = true) {
  if (wantToTryView) wantToTryView.hidden = true;
  originalOpenRecipe(id, updateHistory);
  setHomeButtonVisible(true);
  setBrowseActionsVisible(false);
  attachAuthorBadgeHandlers(recipeDetail);
};

showHome = function(updateHistory = true) {
  if (wantToTryView) wantToTryView.hidden = true;
  originalShowHome(updateHistory);
  setHomeButtonVisible(false);
  setBrowseActionsVisible(true);
};

startCooking = function(id) {
  if (wantToTryView) wantToTryView.hidden = true;
  originalStartCooking(id);
  setHomeButtonVisible(true);
  setBrowseActionsVisible(false);
};

function showWantToTry(updateHistory = true) {
  homeView.hidden = true;
  recipeView.hidden = true;
  if (cookingView) cookingView.hidden = true;
  if (wantToTryView) wantToTryView.hidden = false;
  hero.hidden = false;
  siteFooter.hidden = false;
  setHomeButtonVisible(true);
  setBrowseActionsVisible(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (updateHistory) history.pushState({ wantToTry: true }, "", "#want-to-try");
}

if (globalHomeButton) {
  globalHomeButton.addEventListener("click", () => {
    selectedAuthor = null;
    selectedCategory = "All";
    homeExpanded = false;
    searchInput.value = "";
    setupCategories();
    showHome();
    renderRecipes();
  });
}

if (viewAllButton) {
  viewAllButton.addEventListener("click", () => {
    selectedAuthor = null;
    selectedCategory = "All";
    homeExpanded = true;
    searchInput.value = "";
    setupCategories();
    renderRecipes();
    window.scrollTo({ top: recipeGrid.offsetTop - 24, behavior: "smooth" });
  });
}

if (wantToTryButton) wantToTryButton.addEventListener("click", () => showWantToTry());

searchInput.addEventListener("input", () => {
  selectedAuthor = null;
  renderRecipes();
});

categoryButtons.addEventListener("click", event => {
  const button = event.target.closest(".category-button");
  if (!button) return;
  selectedAuthor = null;
  homeExpanded = button.dataset.category !== "All";
  setTimeout(renderRecipes, 0);
});

window.addEventListener("popstate", () => {
  if (location.hash === "#want-to-try") {
    showWantToTry(false);
    return;
  }

  const authorHash = location.hash.match(/^#author-(.+)$/);
  if (authorHash) {
    selectedAuthor = decodeURIComponent(authorHash[1]);
    selectedCategory = "All";
    homeExpanded = true;
    searchInput.value = "";
    setupCategories();
    showHome(false);
    renderRecipes();
  }
});

if (location.hash === "#want-to-try") {
  showWantToTry(false);
} else {
  renderRecipes();
  attachAuthorBadgeHandlers(document);
  setHomeButtonVisible(!homeView || homeView.hidden);
}
