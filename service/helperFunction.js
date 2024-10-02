function sendResponse(res, status, data, message) {
    if (message === undefined) return res.status(status).json(data);
    return res.status(status).json({ message: message });
}
function sendError(res, status, error, stack) {
    console.error(error, stack);
    return res.status(status).json({ error: error });
}
module.exports = { sendResponse, sendError }