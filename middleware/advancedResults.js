const getConditionQuery = (query) => {
  let reqQuery = { ...query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and remove from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, $lt, $lte, $in)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  console.log("queryStr", queryStr);
  queryStr = JSON.parse(queryStr);
  if (
    queryStr &&
    queryStr.category &&
    queryStr.category[`$in`] &&
    typeof queryStr.category[`$in`] === "string"
  )
    queryStr.category[`$in`] = [queryStr.category[`$in`]];
   if (
      queryStr &&
      queryStr.lake &&
      queryStr.lake[`$in`] &&
      typeof queryStr.lake[`$in`] === "string"
   )
   queryStr.lake[`$in`] = [queryStr.lake[`$in`]];
  
  return queryStr;
};

const advancedResults = (model, populate) => async (req, res, next) => {
  try {
    let query;

    const conditionQuery = getConditionQuery(req.query);

    // Finding resource

    console.log("conditionQuery", conditionQuery);
    query = model.find(conditionQuery);

    // SELECT FIELDS
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Pagination, set page default and limit default after ||
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let results = await query;
    let total = results.length;
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

    // SORT
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      console.log("sortBy", sortBy);
      query = query.sort(sortBy);
    } else {
      if (model.modelName === "Attraction") {
        // default sort for Attraction model
        // select query
        let fields = Object.keys(model.schema.paths),
          select = {};
        if (req.query.select) fields = req.query.select.split(",");
        fields.map((field) => {
          select[field] = 1;
        });
        let condition = [
          {
            $project: {
              ...select,
              likesCount: { $size: { $ifNull: ["$likes", []] } },
            },
          },
          { $sort: { sponsored: -1, likesCount: -1, name: 1 } },
          { $match: { ...conditionQuery } },
        ];
        results = await model.aggregate(condition);
        total = results.length;
        results = await model.aggregate([
          ...condition,
          { $skip: startIndex },
          { $limit: limit },
        ]);

        res.advancedResults = {
          success: true,
          count: total,
          pagination,
          data: results,
        };
        next();
        return;
      } else {
        query = query.sort("name");
      }
    }

    query = query.skip(startIndex).limit(limit);

    if (populate) {
      query = query.populate(populate);
    }

    // Executing query
    results = await query;

    res.advancedResults = {
      success: true,
      count: total,
      pagination,
      data: results,
    };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = advancedResults;
