const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};



// function asyncHandler(fn) {
//     return async (req, res, next) => {
//         try {
//             await fn(req, res, next);
//         } catch (error) {
//             res.status(error.status || 500).json({ message: error.message, success: false });
//         }
//     };
// }

export { asyncHandler };