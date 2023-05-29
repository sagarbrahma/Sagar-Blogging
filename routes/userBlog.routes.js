const router = require('express').Router();
const multer= require ('multer');
const userController = require('../controllers/user.controller');
const path = require ('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads')
    },
    filename: (req, file, cb) => {
        console.log('file', file);
        const uniqueSuffix = Date.now()+'-'+Math.round(Math.random()*1E9);
        cb(null, file.fieldname+'-'+uniqueSuffix+path.extname(file.originalname));
    }
});
const maxSize = 1*1024*1024; // 1 MB

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if(file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
            cb(null, true)
        }else {
            cb(null, false);
            return cb(new Error('Only jpg, jpeg, png are allowed!!!'))
        }
    },
    limits: maxSize
});

router.get('/', userController.index);
router.get('/show-user-registration-form', userController.showRegistrationPage);
router.post('/register',upload.single('image'), userController.userRegistration);
router.get('/show-login', userController.showLoginPage);
router.post('/login', userController.userLogin);
router.get('/show-blog-section-form', userController.userAuthentication, userController.createBlog);
router.post('/insert', upload.single('image'),userController.userAuthentication, userController.insertBlog);
router.get('/viewpost/:id', userController.viewPost);
router.post('/addcomment',userController.userAuthentication, userController.addComment);
router.get('/show-manage-form',userController.userAuthentication, userController.managePost);
router.get('/edit/:id', userController.userAuthentication, userController.showUpdatePost);
router.post('/update', upload.single('image'), userController.userAuthentication, userController.updatePost);
router.get('/delete/:id', userController.userAuthentication, userController.deletePost);
router.get("/show-contact-us-form", userController.contactform);
router.post("/add-contact", userController.contact);
router.get("/forgot", userController.forgot);
router.post("/getlink", userController.getLink);
router.get("/resetpassword/:email/:forgottoken", userController.resetPassword);
router.post("/resetpassword/:email/:forgottoken", userController.reset);
router.get("/logout", userController.logout);




router.get("/fetchproducts", userController.fetchProducts);


module.exports = router;
