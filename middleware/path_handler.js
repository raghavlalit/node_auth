const notFound = (req, res) => {
    return res.status(401).json({
        statusCode: 404,
        message: 'Invalid Endpoint URL !'
    })
    // API_RESPONSE.apiFailure(req,res, 'Invalid Endpoint URL !', 404);
};

export default notFound;