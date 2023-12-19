const express = require('express');
const serverless = require('serverless-http');
const app = express();
// const router = express.Router();

let records = [];

//Get all students
const express = require('express');
const router = express.Router();
require("../db/connect");
const { Language, QuoteUser, Email_Database, ContactPageUser, AdminSignup_PageUser,Blog_Database } = require("../db/userSchema");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const dayjs = require('dayjs');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({ storage: storage });

const currentD = dayjs().format('DD/MM/YYYY'); 
const currentT = dayjs().format('hh:mm A'); 

const currentDate = `Date: ${currentD}\nTime: ${currentT}`;

router.get('/', (req,res) =>{
  res.json({
    'hello' :'welcome'
  });
});
router.post('/register', async (req, res) => {
  const { name, username, email, password, cpassword } = req.body;

  if (!name || !username || !email || !password || !cpassword) {
    return res.status(422).json({ error: "Please! filled the filled properly" });
  }
  try {
    const UserExist = await AdminSignup_PageUser.findOne({ email: email })
    if (UserExist) {
      return res.status(422).json({ error: "Email Already Exist " })
    } else if (password != cpassword) {
      return res.status(422).json({ error: "password is not matching please try again" })
    } else {
      const user = new AdminSignup_PageUser({ name, username, email, password, cpassword })
      await user.save();
      res.status(201).json({ message: "User Register Successfully" })
    }

  }
  catch (err) {
    console.log(err);
  }

})
router.post('/login', async (req, res) => {
  try {
    let Token;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please! filled the filled properly" });
    }
    const userLogin = await AdminSignup_PageUser.findOne({ email: email })
    if (userLogin) {
      const isMatch = await bcrypt.compare(password, userLogin.password)
      Token = await userLogin.generateAuthToken()

      res.cookie("jwtoken", Token, {
        expires: new Date(Date.now() + 86400000),
        httpOnly: true
      });
      if (!isMatch) {
        res.status(400).json({ error: "Invalid Credientials" })
      }
      else {
        res.status(201).json({ message: "user signin Successfully", Token });
      }
    }
    else {
      res.status(400).json({ error: "Invalid Credientials" })
    }
  }
  catch (err) {
    console.log(err);
  }
})
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log(token);
  if (!token) {
    return res.status(403).json({ error: 'Token not provided' });
  }

  const decoded = jwt.verify(token, "bMPwsN9GE8J&YSR;h@nm-'")

  req.user = decoded;
  next();
};

router.get('/admin/dashboard', verifyToken, async (req, res) => {
  const user = await AdminSignup_PageUser.findById(req.user);
  res.json(user.name)
});

router.post('/get-a-quote', async (req, res) => {
  const { name, email, sourceLanguage, targetLanguage, services, uploadlink } = req.body;

  if (!name || !email || !sourceLanguage || !targetLanguage || !services || !uploadlink) {
    return res.status(422).json({ error: "Please! filled the filled properly" });
  }
  try {
    const user = new QuoteUser({ name, email, sourceLanguage, targetLanguage, services, uploadlink, submissionDateTime: currentDate })
    await user.save();
    res.status(201).json({ message: "Get-Quote User Added Successfully" })

  }
  catch (err) {
    console.log(err);
  }

})

router.post('/email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({ error: "Please! filled the filled properly" });
  }
  try {
    const user = new Email_Database({ email,submissionDateTime: currentDate })
    await user.save();
    res.status(201).json({ message: "User Email Added Successfully" })
  }
  catch (err) {
    console.log(err);
  }

})

router.post('/contact', async (req, res) => {
  const { name, phone, email, sourceLanguage, targetLanguage, projectSize, uploadDocument, message } = req.body;

  if (!name || !email || !sourceLanguage || !targetLanguage ) {
    return res.status(422).json({ error: "Please! filled the filled properly" });
  }
  try {
    const user = new ContactPageUser({ name, phone, email, sourceLanguage, targetLanguage, projectSize, uploadDocument, message, submissionDateTime: currentDate })
    await user.save();
    res.status(201).json({ message: "Contact User Added Successfully" })

  }
  catch (err) {
    console.log(err);
  }

})
router.get('/admin/dashboard/contact-table', async (req, res) => {
  try {
    const data = await ContactPageUser.find();
    res.json(data);
  } catch(err) {
    console.log(err)
  }
})
router.get('/admin/dashboard/connect-email', async (req, res) => {
  try {
    const data = await Email_Database.find();
    res.json(data);
  } catch(err) {
    console.log(err)
  }
})
router.get('/admin/dashboard/getquote', async (req, res) => {
  try {
    const data = await QuoteUser.find();
    res.json(data);
  } catch(err) {
    console.log(err)
  }
})
router.post('/blogs', upload.single('image'), async (req, res) => {
  try {
    const { title, content, description } = req.body;

    const newBlog = new Blog_Database({
      title,
      content,
      image: req.file.path,
      description,
      CreatedAt: currentDate,
      updatedAt : currentDate
    });

    console.log('Received data:', { title, content, description , image: req.file });

    await newBlog.save();

    res.status(201).json({ success: true, message: 'Blog post created successfully', blog: newBlog });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/updateblog', async (req, res) => {
  try {
    const data = await Blog_Database.find();

    const convertedData = await Promise.all(data.map(async (item) => {
      if (item.image) {
        const convertedImageBuffer = await sharp(item.image).toFormat('jpeg').toBuffer();
        const convertedImageDataUrl = `data:image/jpeg;base64,${convertedImageBuffer.toString('base64')}`;
        return { ...item.toObject(), image: convertedImageDataUrl };
      }
      return item;
    }));

    res.json(convertedData);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/blogs/top3', async (req, res) => {
  try {
    const topBlogs = await Blog_Database.find().limit(3).sort({ _id: 1 });
    const convertedData = await Promise.all(topBlogs.map(async (item) => {
      if (item.image) {
        const convertedImageBuffer = await sharp(item.image).toFormat('jpeg').toBuffer();
        const convertedImageDataUrl = `data:image/jpeg;base64,${convertedImageBuffer.toString('base64')}`;
        return { ...item.toObject(), image: convertedImageDataUrl };
      }

      return item;
    }));
    res.status(200).json(convertedData);
  } catch (error) {
    console.error('Error fetching top blogs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/blogs/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const blog = await Blog_Database.findById(id);
      console.log(blog);
      if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
      }     
      res.status(200).json(blog);
  } catch (error) {
      console.error('Error individual blog:', error);
      res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/updateblog/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
console.log(id);
console.log(req.body);
const currentD1 = dayjs().format('DD/MM/YYYY'); 
const currentT1 = dayjs().format('hh:mm A'); 

const currentDate1 = `Date: ${currentD1}\nTime: ${currentT1}`;
  try {
      const { title, content, description } = req.body;

      const updatedBlog = {
          title,
          content,
          description,
          updatedAt: currentDate1,
      };

      if (req.file) {
          updatedBlog.image = req.file.path;
      }
      console.log('---------------------------')
      console.log(updatedBlog)
      console.log('---------------------------')

      const blog = await Blog_Database.findByIdAndUpdate(id, updatedBlog);
      console.log('------------****---------------')
       console.log(blog);
      console.log('------------****---------------')

      if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
      }

      res.status(200).json({ success: true, message: 'Blog updated successfully', blog });
  } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/blogs/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const blog = await Blog_Database.findByIdAndDelete(id);

      if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
      }

      res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
router.get('/getlanguages', async (req, res) => {
  try {
    const { type } = req.query;
    const languages = await Language.find();
    console.log(languages);
    res.json(languages);
  } catch (error) {
    console.error('Error getting languages:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create a new language entry
router.post('/languages', async (req, res) => {
  try {
    const { label, value, type } = req.body;
    const language = new Language({ label, value, type, CreatedAt: currentDate });
    const savedLanguage = await language.save();
    res.json(savedLanguage);
  } catch (error) {
    console.error('Error creating language:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/languages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Language.findByIdAndDelete(id);
    res.json({ message: 'Language deleted successfully' });
  } catch (error) {
    console.error('Error deleting language:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;


app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
