const notFound = (req, res) => {
    API_RESPONSE.apiFailure(req,res, 'Invalid Endpoint URL !', 404);
};

export default notFound;