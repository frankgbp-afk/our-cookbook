# Let's Cook — our family cookbook

A mobile-friendly collection of family recipes hosted with GitHub Pages.

Live site: https://frankgbp-afk.github.io/our-cookbook/

## Adding and editing recipes

- `recipes.js` holds the original recipes.
- `recipes-added.js` and `beth-biscuits-and-gravy.js` contain later additions.
- Give every recipe a unique `id`, appropriate category, ingredients, and instructions.
- Recipe photographs are stored at the repository root. Filenames are case-sensitive.
- A recipe's `author` enables its clickable contributor filter.
- Change recipe data in its source file, not inline overrides in `index.html`.

## How the site works

- `index.html`: page markup and script loading
- `app.js`: recipe detail, servings controls, and step-by-step cooking mode
- `redesign.js`: browsing, search, author/category filtering and URL routing
- `styles.css`: base theme and recipe detail styles
- `redesign.css`: compact card layout and newer overrides
- `app.webmanifest` and `sw.js`: installation support; offline recipe caching is **not** implemented

## Quick checks after editing

1. Confirm eight recipes appear on the home page; use **View All Recipes**.
2. Search by ingredient or author, and try category filters.
3. Open a recipe using the card, and filter by author using its badge.
4. Verify browser Back/Forward works from a recipe and a contributor view.
5. Change servings with recipes containing fractions, ranges and gram equivalents.
6. Advance through Start Cooking and return to the full recipe.
7. Check mobile two-column cards and verify all photos load.
