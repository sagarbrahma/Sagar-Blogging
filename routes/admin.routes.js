const router = require('express').Router();
const adminController = require('../controllers/admin.controller');


router.get('/', adminController.showIndex);
router.get('/registration-form', adminController.registrationForm);
router.post('/registration', adminController.registration);
router.post('/login', adminController.login);
router.get('/dashboard', adminController.adminAuth, adminController.dashboard);
router.get('/template', adminController.template);
router.get('/show-category-form', adminController.adminAuth, adminController.showAddCategory);
router.post('/add-category', adminController.adminAuth, adminController.addCategory);
router.get('/view-category', adminController.adminAuth, adminController.viewCategory);
router.get('/show-user-list', adminController.adminAuth, adminController.showUserList);
router.get('/activated_users/:id', adminController.adminAuth,adminController.active_User);
router.get('/deactivated_users/:id', adminController.adminAuth,adminController.deActive_User);
router.get('/delete-users/:id', adminController.adminAuth,adminController.delete_user);
router.get('/show-banner-form', adminController.adminAuth, adminController.showBanner);
router.post('/add-banner', adminController.adminAuth, adminController.addBanner);
router.get('/show-blog-list', adminController.adminAuth, adminController.listing);
router.get('/activated_blogs/:id', adminController.adminAuth,adminController.active_Blog);
router.get('/deactivated_blogs/:id', adminController.adminAuth,adminController.deActive_Blog);
router.get('/delete-blogs/:id', adminController.adminAuth,adminController.delete_blog);
router.get('/show-comment-list', adminController.adminAuth, adminController.commentlisting);
router.get('/activated_comments/:id', adminController.adminAuth,adminController.active_Comment);
router.get('/deactivated_comments/:id', adminController.adminAuth,adminController.deActive_Comment);
router.get('/delete-comments/:id', adminController.adminAuth,adminController.delete_comment);
router.get('/logout',adminController.logout);

module.exports = router;