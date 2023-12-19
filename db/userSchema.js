const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ContactuserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  sourceLanguage: {
    type: String,
    required: true,
  },
  targetLanguage: {
    type: String,
    required: true,
  },
  projectSize: {
    type: String,
  },
  uploadDocument: {
    type: Array,
  },
  message: {
    type: String,
  },
  submissionDateTime:
  {
    type: String,
    required: true,
  }
})


const QuoteUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  sourceLanguage: {
    type: Array,
    required: true,
  },
  targetLanguage: {
    type: Array,
    required: true,
  },
  services: {
    type: Array,
  },
  uploadlink: {
    type: String,
  },
  submissionDateTime:
  {
    type: String,
    required: true,
  }
});
const AdminSignupUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
}
);
const EmailSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  submissionDateTime:
  {
    type: String,
    required: true,
  }
})
const UpdateBlog = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  description: {
    type: String
  },
  CreatedAt:
  {
    type: String,
    required: true,
  },
  updatedAt:
  {
    type: String,
    required: true
  }
})

const languageSchema = new mongoose.Schema({
  label: String,
  value: String,
  type: String,
  CreatedAt: {
    type: String,
    required: true,
  }
});


AdminSignupUserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.cpassword = await bcrypt.hash(this.cpassword, 12);
  }
  next();
});

AdminSignupUserSchema.methods.generateAuthToken = async function () {
  try {
    let Token = jwt.sign({ _id: this._id }, process.env.SECRETKEY);
    this.tokens = this.tokens.concat({ token: Token })
    await this.save();
    return Token;
  } catch (err) {
    console.log(err);
  }
}

const Language = mongoose.model('Language', languageSchema);
const Blog_Database = mongoose.model('Blog', UpdateBlog);
const Email_Database = mongoose.model('email', EmailSchema);
const AdminSignup_PageUser = mongoose.model('admin-signup-user', AdminSignupUserSchema);
const ContactPageUser = mongoose.model('contact-user', ContactuserSchema);
const QuoteUser = mongoose.model('quote-user', QuoteUserSchema);

module.exports = {
  AdminSignup_PageUser,
  ContactPageUser,
  QuoteUser,
  Email_Database,
  Blog_Database,
  Language,
};