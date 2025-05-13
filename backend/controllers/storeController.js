import {
  getAllStoresModel,
  getStoreByIdModel,
  getStoresWithMunicipality,
  createStoreModel,
  getAllStoresWithInfoModel,
  getStoreWithFullInfoModel,
  updateStoreModel,
  deleteStoreModel,
} from "../models/storeModel.js";

import { updateUserByIdModel, getUserByIdModel } from "../models/userModel.js";
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

// Henter alle butikker med tilhørende informasjon (f.eks. kommune, kjede)
export const getAllStoresWithInfoController = async (req, res) => {
  try {
    const stores = await getAllStoresWithInfoModel();
    return res.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter en spesifikk butikk basert på ID 
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

// Henter butikker i en eller flere kommuner (filtrert med query-parametere)
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

// Henter en butikk med full informasjon – benytter egen modell
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

// Lager ny butikk – kun tillatt for admin
export const createStoreController = async (req, res) => {
  const sanitized = sanitizeStoreUpdate(req.body);

  if (sanitized.errors) {
    return res.status(400).json({ error: sanitized.errors });
  }

  try {
    const newStore = await createStoreModel(sanitized);

    // Hvis butikksjef-ID er oppgitt, knytt den til butikken
    if (sanitized.manager_id) {
      const manager = await getUserByIdModel(sanitized.manager_id);

      if (!manager) {
        return res.status(404).json({ error: { manager_id: "Manager not found." } });
      }

      // Sjekker at butikksjef ikke allerede er tilknyttet en annen butikk
      if (manager.store_id) {
        return res.status(400).json({
          error: {
            manager_id: "Denne brukeren er allerede registrert som butikksjef for en annen butikk.",
          },
        });
      }

      const updatedUser = await updateUserByIdModel(sanitized.manager_id, {
        store_id: newStore.store_id,
      });

      if (!updatedUser) {
        return res.status(500).json({
          error: { general: "Butikk ble opprettet, men klarte ikke knytte butikksjef." },
        });
      }
    }

    res.status(201).json(newStore);
  } catch (error) {
    console.error("Error creating store:", error);

    if (error.field) {
      return res.status(400).json({ error: { [error.field]: error.message } });
    }

    res.status(500).json({ error: { general: error.message } });
  }
};

// Oppdaterer butikk – kun tillatt for admin
export const updateStoreController = async (req, res) => {
  const { storeId } = req.params;
  const storeData = req.body;
  const { manager_id } = storeData;

  const sanitizedStoreData = sanitizeStoreUpdate(storeData);
  if (sanitizedStoreData.errors) {
    return res.status(400).json({ error: sanitizedStoreData.errors });
  }

  try {
    const updatedStore = await updateStoreModel(storeId, sanitizedStoreData);
    if (!updatedStore) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Hvis ny butikksjef er valgt, knytt denne til butikken
    if (manager_id) {
      const manager = await getUserByIdModel(manager_id);

      if (!manager) {
        return res.status(404).json({ error: { manager_id: "Manager not found." } });
      }

      // Sjekker at butikksjef ikke allerede er tilknyttet en annen butikk
      if (manager.store_id && manager.store_id !== parseInt(storeId)) {
        return res.status(400).json({
          error: {
            manager_id: "Denne brukeren er allerede registrert som butikksjef for en annen butikk.",
          },
        });
      }

      const updatedUser = await updateUserByIdModel(manager_id, { store_id: storeId });
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update store_id for manager." });
      }
    }

    return res.json(updatedStore);
  } catch (error) {
    console.error("Error updating store:", error);

    if (error.field) {
      return res.status(400).json({
        error: {
          [error.field]: error.message,
        },
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

// Sletter en butikk – kun tilgjengelig for admin
export const deleteStoreController = async (req, res) => {
  const { store_id } = req.params;

  try {
    const store = await getStoreByIdModel(store_id);
    if (!store) {
      return res.status(404).json({ error: "Butikken finnes ikke." });
    }

    // Sjekker at bruker som prøver å slette er admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Du har ikke tilgang til å slette denne butikken." });
    }

    await deleteStoreModel(store_id);

    return res.status(200).json({ message: "Butikken ble slettet." });
  } catch (error) {
    console.error("Feil ved sletting av butikk:", error);
    return res.status(500).json({ error: "Kunne ikke slette butikken." });
  }
};
