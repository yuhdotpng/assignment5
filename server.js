// Import packages, initialize an express app, and define the port you will use
const express = require('express');
const app = express();
const port = 3001;
const { body, validationResult } = require('express-validator');

//server data
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here

const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  
    // Log request body for POST and PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
         console.log('Request Body:',
   JSON.stringify(req.body, null, 2));
}
  
    next(); // Pass control to next middleware
};

const menuItemValidation = [
  body('name')
    .isString()
    .isLength({min: 3})
    .withMessage('Name must be a string with at least 3 characters'),
  body('description')
    .isString()
    .isLength({min: 10})
    .withMessage('Name must be a string with at least 10 characters'),
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a float greater than 0'),
  body('category')
    .isString()
    .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
    .withMessage('Category must be appetizer, entree, dessert, or beverage'),
  body('ingredients')
    .isArray({ min: 1})
    .withMessage('Ingredients must be an array with at least one ingredient'),
  body('available')
  .isBoolean()
  .default(true)
  .withMessage('Available must be true or false')
]
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
        const errorMessages =
    errors.array().map(error => error.msg);
    
        return res.status(400).json({
            error: 'Validation failed',
            messages: errorMessages
        });
    }
  
    // Set default value for completed if not provided
    if (req.body.completed === undefined) {
        req.body.completed = false;
    }
  
    next();
};

app.use(express.json());
app.use(requestLogger);


app.get('/', (req, res) => {
    res.json({ 
        message: "Welcome to the Resturant API", 
        endpoints: { 
            "GET /api/menu": "Get all menu items", 
            "GET /api/menu/:id": "Get a specific menu by ID" 
        } 
    }); 
});
// GET /items - Return all menu items
app.get('/api/menu', (req, res) => {
      res.json(menuItems);});
      
app.get('/api/menu/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const item = menuItems.find(m => m.id === itemId);
	// Return item  if it is found
    if (item) {
        res.json(item);
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});
    // POST /api/menu - Create a new item
app.post('/api/menu', menuItemValidation, handleValidationErrors, (req, res) => {
    // Extract data from request body
     const { name, description, price, category, ingredients, available } = req.body;
  	// Create new item with generated ID
    const newItem = {
        id: menuItems.length + 1,
        name,
        description,
        price,
        category,
        ingredients, 
        available
    };
  
    // Add to items array
    menuItems.push(newItem);
    
    // Return the created item with 201 status
    res.status(201).json(newItem);
});

// PUT /menu/:id - Update an existing item
app.put('/api/menu/:id', menuItemValidation, handleValidationErrors, (req, res) => {
    const itemId = parseInt(req.params.id);
    const { name, description, price, category, ingredients, available } = req.body;
  
    // Find the item to update
    const itemIndex = menuItems.findIndex(m => m.id === itemId);
  
    if (itemIndex === -1) {
          return res.status(404).json({error: 'Item not found'});
    }
  
    // Update the item
    menuItems[itemIndex] = {
        id: itemId,
        name,
        description,
        price,
        category,
        ingredients, 
        available
    };
  
    // Return the updated item
    res.json(menuItems[itemIndex]);
});

// DELETE /menu/:id - Delete an item
app.delete('/api/menu/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
  
    // Find the item index
    const itemIndex = menuItems.findIndex(m => m.id === itemId);
  
    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found' });
    }
  
    // Remove the item from array
    const deletedItem = menuItems.splice(itemIndex, 1)[0];
  
    // Return the deleted item
    res.json({ message: 'Item deleted successfully', item: deletedItem });
});

// Start the server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
  });
}

module.exports = app; // Export the app for testing