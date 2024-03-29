const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // setting unique to true creates an index for the email field, to help speed up DB queries for this field
  password: { type: String, required: true, minlength: 8 },
  image: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }],
  // using array [ ] tells Mongoose that in documents based on the schema, we can have multiple places entries, instead of just one value
});

userSchema.plugin(uniqueValidator); // ensures a new user can only be created if the email does't already exist

module.exports = mongoose.model('User', userSchema);
