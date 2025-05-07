const { v4: uuidv4 } = require("uuid");
const affirmationRepository = require("../repositories/affirmations.repository");
const baseResponse = require("../utils/baseResponse.utils");
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

exports.createAffirmation = async (req, res) => {
    const { message, user_name } = req.body;

    if (!message) {
        return baseResponse(res, false, 400, "Message is required, null");
    }

    try {
        const newAffirmation = await affirmationRepository.createAffirmation({
            id: uuidv4(),
            message,
            user_name: user_name || "Anonim", // fallback ke "Anonim" kalau kosong
            created_at: new Date(),
        });
        return baseResponse(res, true, 201, "Affirmation created", newAffirmation);
    } catch (error) {
        console.error("Error creating affirmation:", error);
        return baseResponse(res, false, 500, "Failed to create affirmation", { error: error.message });
    }
};

exports.getAllAffirmations = async (req, res) => {
    try {
        const affirmations = await affirmationRepository.getAllAffirmations();
        return baseResponse(res, true, 200, "Affirmations retrieved", affirmations);
    } catch (error) {
        return baseResponse(res, false, 500, "Error retrieving affirmations", { error: error.message });
    }
};

exports.deleteAffirmation = async (req, res) => {
    const { id } = req.params;

    if (!uuidRegex.test(id)) {
        return baseResponse(res, false, 400, "Invalid affirmation ID format", null);
    }

    try {
        const deleted = await affirmationRepository.deleteAffirmation(id);
        if (!deleted) {
            return baseResponse(res, false, 404, "Affirmation not found", null);
        }
        return baseResponse(res, true, 200, "Affirmation deleted", deleted);
    } catch (error) {
        return baseResponse(res, false, 500, "Error deleting affirmation", { error: error.message });
    }
};
