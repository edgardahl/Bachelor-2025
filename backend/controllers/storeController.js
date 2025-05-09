import {
  getAllStoresModel,
  getStoreByIdModel,
  getStoresWithMunicipality,
  createStoreModel,
  getAllStoresWithInfoModel,
  getStoreWithFullInfoModel,
  updateStoreModel
} from "../models/storeModel.js";

import { updateUserByIdModel } from "../models/userModel.js"; // importere updateUserByIdModel

import { sanitizeStoreUpdate } from "../utils/sanitizeInput.js";

// Henter alle butikker
export const getAllStoresController = async (req, res) => {
  try {
    const stores = await getAllStoresModel();
    return res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter alle butikker med tilhørende informasjon
export const getAllStoresWithInfoController = async (req, res) => {
  try {
    const stores = await getAllStoresWithInfoModel();
    return res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter en butikk med ID
export const getStoreByIdController = async (req, res) => {
  const { storeId } = req.params;

  try {
    const store = await getStoreByIdModel(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    return res.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter butikker i en kommune
export const getStoresWithMunicipalityController = async (req, res) => {
  try {
    const { municipality, store_chain, page = 1, pageSize = 10000 } = req.query;

    const municipalities = municipality
      ? municipality.split(",").map((name) => name.trim())
      : [];

    const storeChains = store_chain
      ? store_chain.split(",").map((sc) => sc.trim())
      : [];

    const storesWithPagination = await getStoresWithMunicipality(
      municipalities,
      storeChains,
      Number(page),
      Number(pageSize)
    );

    res.json(storesWithPagination);
  } catch (error) {
    console.error("Error fetching stores with municipality:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Oppretter en ny butikk
export const createStoreController = async (req, res) => {
  try {
    const newStore = await createStoreModel(req.body);
    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ error: error.message });
  }
};

// Henter butikk med full informasjon fra denne modellen getStoreWithFullInfoModel
export const getStoreWithInfoController = async (req, res) => {
  const { storeId } = req.params;

  try {
    const store = await getStoreWithFullInfoModel(storeId);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    return res.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const updateStoreController = async (req, res) => {
  const { storeId } = req.params;
  const storeData = req.body;
  const { manager_id } = storeData;
  console.log("Store data to update:", storeData);
  console.log("Manager ID to update:", manager_id);
  console.log("Store ID from params:", storeId);

  // Sanitize store data before updating
  const sanitizedStoreData = sanitizeStoreUpdate(storeData);
  if (sanitizedStoreData.errors) {
    return res.status(400).json(sanitizedStoreData.errors); // Return validation errors
  }

  try {
    // Proceed to update the store with sanitized data
    const updatedStore = await updateStoreModel(storeId, sanitizedStoreData);
    if (!updatedStore) {
      return res.status(404).json({ error: "Store not found" });
    }

    // If a new manager is selected, update the manager's store_id
    if (manager_id) {
      const updatedUser = await updateUserByIdModel(manager_id, { store_id: storeId });
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update store_id for manager." });
      }
    }

    return res.json(updatedStore); // Send back the updated store data
  } catch (error) {
    console.error("Error updating store:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};