const cloudinary = require("../utils/cloudinary.config");
const { v4: uuidv4 } = require("uuid");
const itemRepository = require("../repositories/item.repository");
const baseResponse = require("../utils/baseResponse.utils");
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

exports.createItem = async (req, res) => {
    const { name, store_id } = req.body;
    const price = Number(req.body.price);
    const stock = Number(req.body.stock);

    if (isNaN(price) || price <= 0) {
        return baseResponse(res, false, 400, "Price must be a positive number");
    }
    
    if (isNaN(stock) || stock < 0) {
        return baseResponse(res, false, 400, "Stock must be a non-negative number");
    }    

    let imageUrl = null;
    if (req.file) {
        try {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "items" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        } catch (error) {
            return baseResponse(res, false, 500, "Error uploading image", { error: error.message });
        }
    }
    try {
        const createdItem = await itemRepository.createItem({
            id: uuidv4(),
            name,
            price,
            store_id,
            image_url: imageUrl,
            stock: stock ?? 0,
            created_at: new Date(),
        });
        return baseResponse(res, true, 201, "Item created", createdItem);
    } catch (error) {
        return baseResponse(res, false, 500, error.message, null);
    }
};

exports.getItems = async (req, res) => {
    try {
        const items = await itemRepository.getItems();
        return baseResponse(res, true, 200, "Items retrieved", items);
    } catch (error) {
        return baseResponse(res, false, 500, "Error retrieving items", { error: error.message });
    }
};

exports.getItemById = async (req, res) => {
    const { id } = req.params;
    if (!uuidRegex.test(id)) {
        return baseResponse(res, false, 400, "Invalid item ID format");
    }    
    try {
        const item = await itemRepository.getItemById(id);
        if (!item) {
            return baseResponse(res, false, 404, "Item not found", null);
        }
        return baseResponse(res, true, 200, "Item retrieved", item);
    } catch (error) {
        return baseResponse(res, false, 500, "Error retrieving item", { error: error.message });
    }
};

exports.getItemsByStoreId = async (req, res) => {
    const { store_id } = req.params;
    if (!uuidRegex.test(store_id)) {
        return baseResponse(res, false, 400, "Invalid store ID format", null);
    }    
    try {
        const items = await itemRepository.getItemsByStoreId(store_id);
        return baseResponse(res, true, 200, "Items retrieved by store ID", items);
    } catch (error) {
        return baseResponse(res, false, 500, "Error retrieving items by store ID", { error: error.message });
    }
};

exports.updateItem = async (req, res) => {
    const { id, name } = req.body; 
    const price = req.body.price !== undefined ? Number(req.body.price) : undefined;
    const stock = req.body.stock !== undefined ? Number(req.body.stock) : undefined;

    // Pastikan ID ada di request body
    if (!id) {
        return baseResponse(res, false, 400, "ID is required in request body");
    }

    if (price !== undefined && (isNaN(price) || price < 0)) {
        return baseResponse(res, false, 400, "Price must be a positive number");
    }
    if (stock !== undefined && (isNaN(stock) || stock < 0)) {
        return baseResponse(res, false, 400, "Stock must be a non-negative number");
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (req.file) {
        try {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "items" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(req.file.buffer);
            });
            updateData.image_url = result.secure_url;
        } catch (error) {
            return baseResponse(res, false, 500, "Error uploading image", { error: error.message });
        }
    }    
    if (Object.keys(updateData).length === 0) {
        return baseResponse(res, false, 400, "No data to update");
    }    
    try {
        const updatedItem = await itemRepository.updateItem(id, updateData);
        if (!updatedItem) {
            return baseResponse(res, false, 404, "Item not found", null);
        }
        return baseResponse(res, true, 200, "Item updated", updatedItem);
    } catch (error) {
        return baseResponse(res, false, 500, "Error updating item", { error: error.message });
    }
};

exports.deleteItem = async (req, res) => {
    const { id } = req.params;
    if (!uuidRegex.test(id)) {
        return baseResponse(res, false, 400, "Invalid item ID format");
    }    
    try {
        const deleted = await itemRepository.deleteItem(id);
        if (!deleted) {
            return baseResponse(res, false, 404, "Item not found", null);
        }
        return baseResponse(res, true, 200, "Item deleted", deleted);
    } catch (error) {
        return baseResponse(res, false, 500, "Error deleting item", { error: error.message });
    }
};
