import { useEffect, useState, useCallback } from "react";
import FirebaseAuthService from "./FirebaseAuthservice";
import LoginForm from "./components/LoginForm";
import AddEditRecipeForm from "./components/AddEditRecipeForm";

import "./App.css";
// eslint-disable-next-line no-unused-vars
import firebase from "./FirebaseConfig";
import FirebaseFirestoreService from "./FirebaseFirestoreService";

function App() {
  const [user, setUser] = useState(null);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);

  const fetchRecipes = useCallback(async () => {
    const queries = [];

    if (!user) {
      queries.push({
        field: "isPublished",
        condition: "==",
        value: true,
      });
    }

    try {
      const response = await FirebaseFirestoreService.readDocuments(
        "recipes", //nome da colecao diretamente
        queries // Array de queries
      );

      const newRecipes = response.map((recipe) => {
        // Convert timestamps to Date objects
        recipe.publishDate = new Date(recipe.publishDate.seconds * 1000);
        return recipe;
      });

      setRecipes(newRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error.message);
    }
  }, [user]);

  useEffect(() => {
    fetchRecipes(); // Call fetchRecipes on component mount or when 'user' changes
  }, [user, fetchRecipes]); // Add fetchRecipes as a dependency

  useEffect(() => {
    const unsubsribe = FirebaseAuthService.subscribeToAuthChanges(setUser);
    return unsubsribe; // Garante a limpeza ao desmontar
  }, []);

  async function handleFetchRecipes() {
    try {
      await fetchRecipes();
    } catch (error) {
      console.error("Error in handleFetchRecipes:", error.message);
    }
  }

  async function handleAddRecipe(newRecipe) {
    try {
      const response = await FirebaseFirestoreService.createDocument(
        "recipes", // Passa o nome da colecao diretamente
        newRecipe // Documento a ser adicionado
      );

      console.log(response); // verificar resposta no console
      handleFetchRecipes();

      alert(`succesfully created a recipe with an ID = ${response}`); // Response ja eh o ID
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleUpdateRecipe(newRecipe, recipeID) {
    try {
      await FirebaseFirestoreService.updateDocument(
        "recipes",
        recipeID,
        newRecipe
      );

      handleFetchRecipes();
      alert(`successfully updated a recipe with an ID = ${recipeID}`);
      setCurrentRecipe(null);
    } catch (error) {
      alert(error.message);
      throw error;
    }
  }

  async function handleDeleteRecipe(recipe) {
    const deleteConfirmation = window.confirm(
      "Are you sure you want to delete this recipe? OK for Yes. Cancel for No."
    );

    if (deleteConfirmation) {
      try {
        const recipeId = recipe.id;
        await FirebaseFirestoreService.deleteDocument("recipes", recipeId);
        handleFetchRecipes();
        setCurrentRecipe(null);
        window.scrollTo(0, 0);
        alert(`successfully deleted a recipe with an ID = ${recipeId}`);
      } catch (error) {
        alert(error.message);
        throw error;
      }
    }
  }

  function handleEditRecipeClick(recipeID) {
    const selectedRecipe = recipes.find((recipe) => {
      return recipe.id === recipeID;
    });

    if (selectedRecipe) {
      setCurrentRecipe(selectedRecipe);
      window.scrollTo(0, document.body.scrollHeight);
    }
  }

  function handleEditRecipeCancel() {
    setCurrentRecipe(null);
  }

  function lookupCategoryLabel(categoryKey) {
    const categories = {
      breadsSandwichesAndPizza: "Breads, Sandwiches, and Pizza",
      eggsAndBreakfast: "eggs & Breakfast",
      dessertsAndBakedGoods: "Desserts & Baked Goods",
      fishAndSeafood: "Fish & Seafood",
      vegetables: "Vegetables",
    };

    return categories[categoryKey];
  }

  function formatDate(date) {
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getFullYear();
    const dateString = `${day}-${month}-${year}`;

    return dateString;
  }

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase Recipes</h1>
        <LoginForm existingUser={user}></LoginForm>
      </div>
      <div className="main">
        <div className="center">
          <div className="recipe-list-box">
            {recipes && recipes.length > 0 ? (
              <div className="recipe-list">
                {recipes.map((recipe) => {
                  return (
                    <div className="recipe-card" key={recipe.id}>
                      {recipe.isPublished === false ? (
                        <div className="unpublished">UNPUBLISHED</div>
                      ) : null}
                      <div className="recipe-name">{recipe.name}</div>
                      <div className="recipe-field">
                        Category: {lookupCategoryLabel(recipe.category)}
                      </div>
                      <div className="recipe-field">
                        Publish Date: {formatDate(recipe.publishDate)}
                      </div>
                      {user ? (
                        <button
                          type="button"
                          onClick={() => handleEditRecipeClick(recipe.id)}
                          className="primary-button edit-button">
                          EDIT
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        {user ? (
          <AddEditRecipeForm
            existingRecipe={currentRecipe}
            handleAddRecipe={handleAddRecipe}
            handleUpdateRecipe={handleUpdateRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
            handleEditRecipeCancel={handleEditRecipeCancel}></AddEditRecipeForm>
        ) : null}
      </div>
    </div>
  );
}

export default App;
