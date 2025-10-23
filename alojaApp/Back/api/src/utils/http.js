export const createResponse = (req, res, statusCode, data, msg) => {
  return res.status(statusCode).json({
    data,
    status: statusCode,
    msg: msg ?? "success",
    path: req.url,
  });
};
