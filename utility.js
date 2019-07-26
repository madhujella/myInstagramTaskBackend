
const error = (err, statusCode) => {
    const error = new Error(err)
    error.statusCode = statusCode;
    throw error;
}

module.exports = { error }