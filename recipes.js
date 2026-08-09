// ADD NEW RECIPES HERE.
// Copy one recipe object, paste it below the previous one, and change the details.

const recipes = [
  {
    id: "garlic-herb-rice",
    name: "Garlic & Herb Rice",
    category: "Sides",
    description: "A flavorful, buttery rice with garlic and herbs. An easy side for almost any meal.",
    image: "garlic-herb-rice.jpg",
    prepTime: "5 min",
    cookTime: "20 min",
    totalTime: "25 min",
    servings: "4",
    tags: ["rice", "side", "garlic", "easy"],
    ingredients: [
      "1 cup white rice",
      "2 cups water",
      "2 tablespoons butter",
      "Garlic powder, to taste",
      "Parsley flakes, to taste",
      "Italian seasoning, to taste",
      "Salt and pepper, to taste"
    ],
    instructions: [
      "Melt the butter in a saucepan over medium heat.",
      "Add the dry rice and toast for 2–3 minutes, stirring often, until some grains begin to look lightly golden.",
      "Carefully add the water and season with garlic powder, salt, and pepper.",
      "Bring to a boil, then cover and reduce the heat to low.",
      "Cook until the water is absorbed and the rice is tender, about 15–18 minutes.",
      "Remove from the heat and let the rice rest, covered, for 5 minutes.",
      "Fluff with a fork, then stir in parsley and Italian seasoning. Taste and adjust seasoning."
    ],
    notes: "The seasoning amounts are intentionally flexible so this can be adjusted to taste."
  },
  {
    id: "cast-iron-chicken-breasts",
    name: "Cast Iron Chicken Breasts",
    category: "Mains",
    description: "Juicy seasoned chicken breasts seared in a hot cast iron skillet, then finished with butter in the oven.",
    image: "cast-iron-chicken.jpg",
    prepTime: "5 min",
    cookTime: "16 min",
    totalTime: "26 min",
    servings: "Varies",
    tags: ["chicken", "main", "cast iron", "easy", "oven"],
    ingredients: [
      "Boneless, skinless chicken breasts",
      "Oil",
      "Garlic powder",
      "Onion powder",
      "Salt",
      "Black pepper",
      "Butter"
    ],
    instructions: [
      "Preheat the oven to 400°F.",
      "Pat the chicken breasts dry with paper towels.",
      "Lightly coat the chicken with oil, then season both sides with garlic powder, onion powder, salt, and black pepper.",
      "Place a cast iron skillet over high heat and allow it to get hot.",
      "Add the chicken breasts to the hot skillet and sear, without moving them, for 4 minutes.",
      "Flip the chicken breasts and add a chunk of butter to the skillet.",
      "Transfer the skillet directly to the preheated oven.",
      "Cook for 11–12 minutes, or until the chicken reaches 165°F in the thickest part.",
      "Remove from the oven and let the chicken rest for 5 minutes before serving."
    ],
    notes: "The 11–12 minute oven time is a guideline. Chicken breast thickness varies, so use an instant-read thermometer and cook to 165°F."
  },
  {
    id: "loaded-baked-potato-soup",
    name: "Loaded Baked Potato Soup",
    category: "Soups",
    description: "A rich, creamy potato soup loaded with bacon, cheddar, sour cream, salsa verde, and fresh toppings.",
    image: "loaded-potato-soup.jpg",
    prepTime: "15 min",
    cookTime: "30 min",
    totalTime: "45 min",
    servings: "Varies",
    tags: ["soup", "potato", "bacon", "cheddar", "comfort food"],
    ingredients: [
      "6 slices thick-cut bacon, chopped",
      "1 yellow onion, chopped",
      "4 cloves garlic, chopped",
      "Salt and black pepper, to taste",
      "2 tablespoons salted butter",
      "1/4 cup all-purpose flour (or gluten-free flour)",
      "4 cups low-sodium vegetable broth",
      "4 Russet potatoes, peeled and chopped",
      "2 cups milk",
      "1/3 cup salsa verde",
      "1/3 cup plain Greek yogurt or sour cream",
      "1 cup shredded cheddar cheese",
      "1/2 cup fresh cilantro, chopped",
      "Chopped green onion, for serving"
    ],
    instructions: [
      "Cook the chopped bacon in a large pot until crisp. Remove the bacon and set it aside, leaving some bacon fat in the pot.",
      "Add the onion and garlic to the same pot and sauté in the remaining bacon fat. Season lightly with salt and black pepper.",
      "Add the butter, then stir in the flour. Cook briefly until the flour mixture is lightly browned and forms a roux.",
      "Pour in the vegetable broth and add the chopped potatoes. Bring to a simmer and cook for about 15 minutes, or until the potatoes are tender.",
      "Use a potato masher to mash some of the potatoes directly in the pot, leaving plenty of chunks for texture.",
      "Stir in the milk, salsa verde, Greek yogurt or sour cream, and shredded cheddar. Cook gently until the cheese has melted and the soup is creamy.",
      "Ladle into bowls and top with the reserved crispy bacon, additional yogurt or sour cream if desired, cilantro, and chopped green onion."
    ],
    notes: "The timing and serving size were not listed on the original recipe, so the 45-minute total is an estimate. Beer bread is suggested as an optional side for dipping."
  }
];
