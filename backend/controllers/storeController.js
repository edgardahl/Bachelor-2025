import {
  getAllStoresModel,
  getStoreByIdModel,
  getStoresWithMunicipality,
  createStoreModel,
  getAllStoresWithInfoModel
} from "../models/storeModel.js";

export const getAllStoresController = async (req, res) => {
  try {
    const stores = await getAllStoresModel();
    return res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getAllStoresWithInfoController = async (req, res) => {
  try {
    const stores = await getAllStoresWithInfoModel();
    return res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



// Get a single store by ID
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


// Create a new store
export const createStoreController = async (req, res) => {
  try {
    const newStore = await createStoreModel(req.body);
    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ error: error.message });
  }
};
