import { db } from "./FirebaseConfig"; // Import the database from FirebaseConfig
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore"; // Import Firebase functions

const createDocument = async (collectionName, document) => {
  // Function to create a new document in a specified Firestore collection
  try {
    const docRef = await addDoc(collection(db, collectionName), document); // Use Firestore's addDoc to add a new document
    console.log("Document written with ID: ", docRef.id);
    return docRef.id; // Return the ID of the newly created document
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

const readDocuments = async (collectionName, queries = []) => {
  // Function to read documents from a specified Firestore collection with optional query constraints

  try {
    let collectionRef = collection(db, collectionName); // Define the base collection reference

    if (queries && queries.length > 0) {
      // If queries are provided, map each query item to Firestore's 'where' constraints

      const queryConstraints = queries.map((queryItem) =>
        where(queryItem.field, queryItem.condition, queryItem.value)
      );

      collectionRef = query(collectionRef, ...queryConstraints); // Create a Firestore query with constraints
    }

    const querySnapshot = await getDocs(collectionRef); // Fetch the documents based on the query

    return querySnapshot.docs.map((doc) => ({
      // Map over each document in the snapshot to create an array of document data including ID
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error reading documents: ", error);
    throw error;
  }
};

const updateDocument = async (collectionName, id, document) => {
  // Function to update a document in a specified collection by ID

  // 1. Define a reference to the specific document in the collection

  const docRef = doc(db, collectionName, id); // 'doc' creates a reference using the database, collection, and document ID

  try {
    // 2. Update the document with the provided data
    await updateDoc(docRef, document); // 'updateDoc' updates only the fields provided in the 'document' object
    console.log(`Document with ID ${id} updated successfully.`);
    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

const deleteDocument = async (collectionName, id) => {
  try {
    const docRef = doc(db, collectionName, id); // Use the modular syntax to get a reference to the document
    await deleteDoc(docRef); // Use deleteDoc to delete the document
    console.log(`Document with ID ${id} deleted successfully.`);
  } catch (error) {
    console.error(
      `Error deleting document (ID: ${id}) from ${collectionName}:`,
      error
    );
    throw error;
  }
};

const FirebaseFirestoreService = {
  // Export the Firestore service functions for use in other parts of the app
  createDocument,
  readDocuments,
  updateDocument,
  deleteDocument,
};

export default FirebaseFirestoreService;
