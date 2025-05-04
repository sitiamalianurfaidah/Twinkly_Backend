const storeRepository = require("../repositories/store.repository");
const baseResponse = require("../utils/baseResponse.utils");

exports.getAllStores = async (req, res) => {
    try {
        const stores = await storeRepository.getAllStores();
        baseResponse(res, true, 200, "Stores found", stores);
    } catch (error) {
        baseResponse(res, false, 500, "Error retrieving stores", error);
    }
};

exports.createStore = async (req, res) => {
    if (!req.body.name || !req.body.address) {
        return baseResponse(res, false, 400, "Missing store name or address", null);
    }

    try {
        const store = await storeRepository.createStore(req.body);
        baseResponse(res, true, 201, "Store created", store);
    } catch (error) {
        baseResponse(res, false, 500, error.message || "Server Error", error);
    }
};

exports.getStore = async (req, res) => {
    try {
        const store = await storeRepository.getStore(req.params.id);
        if (!store) {
            return baseResponse(res, false, 404, "Store not found", null);
        }
        baseResponse(res, true, 200, "Store found", store);
    } catch (error) {
        baseResponse(res, false, 500, "Error retrieving store", error);
    }
};

exports.updateStore = async (req, res) => {
    const { id, name, address } = req.body;
    if (!id || !name || !address) {
        return baseResponse(res, false, 400, "Missing store id, name, or address", null);
    }

    try {
        const updatedStore = await storeRepository.updateStore(req.body);
        if (!updatedStore) {
            return baseResponse(res, false, 404, "Store not found", null);
        }
        baseResponse(res, true, 200, "Store updated", updatedStore);
    } catch (error) {
        baseResponse(res, false, 500, "Error updating store", error);
    }
};

exports.deleteStore = async (req, res) => {
    try {
        const deletedStore = await storeRepository.deleteStore(req.params.id);
        if (!deletedStore) {
            return baseResponse(res, false, 404, "Store not found", null);
        }
        baseResponse(res, true, 200, "Store deleted", deletedStore);
    } catch (error) {
        baseResponse(res, false, 500, "Error deleting store", error);
    }
};