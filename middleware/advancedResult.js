// ...api?select=name,description
const advancedResult = (model, populate) => async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };
  // Fields to exclude
  const removeFeilds = ["select", "sort", "page", "limit"];
  // Loop over removeFeilds and delete them from reqQuery to not find it as a key in object and use it as query select below
  removeFeilds.forEach((param) => delete reqQuery[param]);
  // Get bootcamps with conditions in query (?averageCost[lte]=10000)
  // Replace to insert '$' at the beginning to make it work ($gt, $gte, ...)
  const queryStr = JSON.stringify(reqQuery).replace(
    /\b(gt|gte|le|lte|in)\b/g,
    (match) => `$${match}`
  );
  // Finding resources
  let query = model.find(JSON.parse(queryStr));
  if (populate) {
    query = query.populate(populate);
  }
  // Check if req has select
  if (req.query.select) {
    const feilds = req.query.select.split(",").join(" ");
    query = query.select(feilds);
  }
  // Check if req has sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startIndex).limit(limit);
  // Executing query
  const results = await query;
  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResult;
