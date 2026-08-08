# Our Cookbook

A simple static family cookbook built with HTML, CSS, and JavaScript.

## Files

- `index.html` — the page structure
- `styles.css` — all visual styling
- `recipes.js` — **this is where recipes live**
- `app.js` — search, categories, cards, and recipe-detail behavior

## Adding another recipe

Open `recipes.js`.

Copy the existing recipe object from the opening `{` through its closing `}`.

Paste it after the previous recipe, separated by a comma, then replace the information.

Each recipe needs a unique `id`, such as:

`"mom-lasagna"`

Use lowercase letters and hyphens for IDs.

## Recipe photos

The starter uses a placeholder automatically when `image` is blank.

Later, we can add an `images` folder and use entries such as:

`image: "images/garlic-herb-rice.jpg"`

## Publishing

This folder is ready to be uploaded to a GitHub repository and published with GitHub Pages.
