import { useEffect, useState, useCallback } from "react";
import FirebaseAuthService from "./FirebaseAuthservice";
import LoginForm from "./components/LoginForm";
import AddEditRecipeForm from "./components/AddEditRecipeForm";
import "./App.css";
//import firebase from "./FirebaseConfig";
import FirebaseFirestoreService from "./FirebaseFirestoreService";

function App() {
  const [user, setUser] = useState(null);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [orderBy, setOrderBy] = useState("publishDateDesc");
  const [recipesPerPage, setRecipesPerPage] = useState(3);

  const fetchRecipes = useCallback(
    async (cursorId = "") => {
      const queries = [];
      if (categoryFilter) {
        queries.push({
          field: "category",
          condition: "==",
          value: categoryFilter,
        });
      }

      if (!user) {
        queries.push({
          field: "isPublished",
          condition: "==",
          value: true,
        });
      }

      const orderByField = "publishDate";
      const orderByDirection = orderBy === "publishDateAsc" ? "asc" : "desc";

      setIsLoading(true);

      try {
        const response = await FirebaseFirestoreService.readDocuments(
          "recipes",
          queries,
          orderByField,
          orderByDirection,
          recipesPerPage,
          cursorId
        );

        const newRecipes = response.map((recipe) => {
          recipe.publishDate = new Date(recipe.publishDate.seconds * 1000);
          return recipe;
        });

        if (cursorId) {
          setRecipes((prevRecipes) => [...prevRecipes, ...newRecipes]);
        } else {
          setRecipes(newRecipes);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [user, categoryFilter, orderBy, recipesPerPage]
  );

  useEffect(() => {
    fetchRecipes(); // Call fetchRecipes on component mount or when 'user' changes
  }, [user, fetchRecipes]); // Add fetchRecipes as a dependency

  useEffect(() => {
    const unsubscribe = FirebaseAuthService.subscribeToAuthChanges(setUser);
    return unsubscribe; // Garante a limpeza ao desmontar
  }, []);

  function handleRecipesPerPageChange(event) {
    const recipesPerPage = event.target.value;

    setRecipes([]);
    setRecipesPerPage(recipesPerPage);
  }

  function handleLoadMoreRecipesClick() {
    const lastRecipe = recipes[recipes.length - 1];
    const cursorId = lastRecipe ? lastRecipe.id : "";
    fetchRecipes(cursorId);
  }

  async function handleFetchRecipes(cursorId = "") {
    try {
      await fetchRecipes(cursorId);
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
        <div className="row filters">
          <label className="recipe-label input-label">
            Category:
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="select"
              required>
              <option value=""></option>
              <option value="breadsSandwichesAndPizza">
                Breads, Sandwiches, and Pizza
              </option>
              <option value="eggsAndBreakfast">eggs & Breakfast</option>
              <option value="dessertsAndBakedGoods">
                Desserts & Baked Goods
              </option>
              <option value="fishAndSeafood">Fish & Seafood</option>
              <option value="vegetables">Vegetables</option>
            </select>
          </label>
          <label className="input-label">
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="select">
              <option value="publishDateDesc">
                Publish Date (newest - oldest)
              </option>
              <option value="publishDateAsc">
                Publish Date (oldest - newest)
              </option>
            </select>
          </label>
        </div>
        <div className="center">
          <div className="recipe-list-box">
            {isLoading ? (
              <div className="fire">
                <div className="flames">
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                </div>
                <div className="logs"></div>
              </div>
            ) : recipes.length === 0 ? (
              <h5 className="no-recipes">No recipes Found</h5>
            ) : (
              <div className="recipe-list">
                {recipes.map((recipe) => (
                  <div className="recipe-card" key={recipe.id}>
                    {!recipe.isPublished && (
                      <div className="unpublished">UNPUBLISHED</div>
                    )}
                    <div className="recipe-name">{recipe.name}</div>
                    <div className="recipe-field">
                      Category: {lookupCategoryLabel(recipe.category)}
                    </div>
                    <div className="recipe-field">
                      Publish Date: {formatDate(recipe.publishDate)}
                    </div>
                    {user && (
                      <button
                        type="button"
                        onClick={() => handleEditRecipeClick(recipe.id)}
                        className="primary-button edit-button">
                        EDIT
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {isLoading || (recipes && recipes.length > 0) ? (
          <>
            <label className="input-label">
              Recipes Per Page:
              <select
                value={recipesPerPage}
                onChange={handleRecipesPerPageChange}
                className="select">
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
              </select>
            </label>
            <div className="pagination">
              <button
                type="button"
                onClick={handleLoadMoreRecipesClick}
                className="primary-button">
                LOAD MORE RECIPES
              </button>
            </div>
          </>
        ) : null}
        {user && (
          <AddEditRecipeForm
            existingRecipe={currentRecipe}
            handleAddRecipe={handleAddRecipe}
            handleUpdateRecipe={handleUpdateRecipe}
            handleDeleteRecipe={handleDeleteRecipe}
            handleEditRecipeCancel={handleEditRecipeCancel}></AddEditRecipeForm>
        )}
      </div>
    </div>
  );
}

export default App;
