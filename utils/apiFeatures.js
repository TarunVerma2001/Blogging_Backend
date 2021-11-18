class APIFeatures {
    //(Model.find(), req.query)
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {
      const queryObj = { ...this.queryString }; //makes a new hard copy of the req.query
      const excludeFields = ['page', 'sort', 'limit', 'fields'];
  
      excludeFields.forEach((el) => delete queryObj[el]); //deletes the elementes of the excludeFieds from the queryObjects
  
      // 1B) Advanced Filtering
      let queryStr = JSON.stringify(queryObj);
      //regular statement, do stack overflow for this
      console.log(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        // if there is a tie in the sorting and we want to sort the data according to other property simultaneously
        const sortBy = this.queryString.sort.split(',').join(' '); //saperate the req.query.sort by space
        console.log(sortBy);
        // because in the url we got url?sort=price, ratingsAverage
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
      return this;
    }
  
    paginate() {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      // if req.query.limit is present then it get that otherwise it will take the default one after ||
      const skip = (page - 1) * limit;
      //page=2&limit=10 , 1-10 page1, 11-20 page2 so on
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
      //it return the object
    }
  }
  
  module.exports = APIFeatures;
  