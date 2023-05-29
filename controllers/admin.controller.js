const MyAdminModel = require('../models/admin.model');
const MyCategoryModel = require('../models/categorymodel');
const MyUserModel = require('../models/usermodel');
const MyBannerModel = require('../models/bannermodel');
const MyBlogModel = require('../models/blogmodel');
const MyCommentModel = require('../models/CommentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class MyAdminController {

  constructor() { }


  /**
   * @Method adminAuth
   * @Description Checking User Authentication 
   */

  async adminAuth(req, res, next) {
    try {
      if (req.admin) {
        console.log(req.admin);
        next()
      } else {
        res.redirect('/admin/')
      }
    } catch (err) {
      throw err;
    }
  }


  /**
   * @Method registrationForm
   * @Description To Show The Registration Form
  */

  async registrationForm(req, res) {
    try {
      res.render('admin/registration', {
        title: "Admin | Registration"
      })
    } catch (err) {
      throw err;
    }
  }

  /**
   * @Method registration
   * @Description To Submit And Perform Logical Stuff In Registration Form
  */

  async registration(req, res) {
    try {

      if (req.body.password === req.body.confirmpassword) {
        req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

        let emailExists = await MyAdminModel.find({ email: req.body.email });

        if (emailExists.length) {
          console.log('Email already exists!!!');

          res.redirect('/admin/')
        } else {
          let saveData = await MyAdminModel.create(req.body);
          console.log(saveData);

          if (saveData && saveData._id) {
            console.log('Saved Successfully');
            res.redirect('/admin/login')

          } else {
            console.log('Data is not saved');
            res.redirect('/admin/registration-form')
          }
        }
      } else {
        console.log('Password & Confirm Password Should Be Same!!!');
        res.redirect('/admin/registration-form');
      }
    } catch (err) {
      throw err;
    }
  }


  /**
   * @Method showIndex
   * @Description To Show The Index Page / Login Page
   */
  async showIndex(req, res) {
    try {
      res.render("admin/index", {
        title: "Admin | Login",
      });
    } catch (err) {
      throw err;
    }
  }


  /**
   *  @Method login
   *  @Description To Perform Login Operations 
  */

  async login(req, res) {
    try {
      let isAdminExists = await MyAdminModel.findOne({ email: req.body.email });

      if (isAdminExists) {

        let hashPassword = isAdminExists.password;

        if (bcrypt.compareSync(req.body.password, hashPassword)) {
          //token creation
          const token = jwt.sign({ id: isAdminExists._id, email: isAdminExists.email },
            'A1B2C3D4E5',
            { expiresIn: '15d' });

          res.cookie('adminToken', token);
          res.redirect('/admin/dashboard');
        } else {

          res.redirect('/admin/index');
        }
      } else {

        res.redirect('/admin/index');
      }
    } catch (err) {
      throw err;
    }
  }


  /**
   * @Method dashboard
   * @Description To Show The Dashboard
   */
  async dashboard(req, res) {
    try {

      let admin = await MyAdminModel.findOne({_id: req.admin.id});

      res.render("admin/dashboard", {
        title: "Admin | Dashboard", admin
      })
    } catch (err) {
      throw err;
    }
  }

  /**
   * @Method template
   * @Description Basic Template
   */
  async template(req, res) {
    try {
      let admin = await MyAdminModel.findOne({_id: req.admin.id});
      res.render("admin/template", {
        title: "Admin | Template",
        admin
      })
    } catch (err) {
      throw err;
    }
  }


  /**
  *@Method showAddCategory
  *@Description To Show the Add Category Section
  */
  async showAddCategory(req, res) {
    try {
      let admin = await MyAdminModel.findOne({_id: req.admin.id});
      res.render("admin/addCategory", {
        title: "Admin | Add Category",
        admin,
        message: req.flash("message"),
        alert: req.flash("alert")
      })

    } catch (err) {
      throw err;
    }
  }


  /**
  *@Method addCategory
  *@Description To Add the Categories
  */
  async addCategory(req, res) {
    try {

      let addCategory = await MyCategoryModel.create(req.body);
      console.log(addCategory);
      if (addCategory && addCategory._id) {
        console.log('category added');
       req.flash("message", "Category Added Successfully!!!");
        res.redirect("/admin/view-category");
      }else{
        console.log("activity failed!");
        res.redirect('/admin/add-category');
      }
    }
    catch (err) {
      throw err;
    }
  }


  /**
  *@Method viewCategory
  *@Description To View the Categories
  */
  async viewCategory(req, res) {
    try {
      let CategoryDetails = await MyCategoryModel.find({});
      let admin = await MyAdminModel.findOne({_id: req.admin.id});
      res.render("admin/viewCategory", {
       
        CategoryDetails,
        admin,
        title: "Admin | category",
      }
      )
    }
    catch (err) {
      throw err;
    }
  }

  /**
    *@Method showUserList
    *@Description To Show the Users
    */
  async showUserList(req, res) {
    try {
      let UserData = await MyUserModel.find({});
      let admin = await MyAdminModel.findOne({_id: req.admin.id});
      res.render("admin/users", {
        title: "Admin | Users",
       
        UserData,
        admin
      })


    } catch (err) {
      throw err;
    }
  }


  /**
  *@Method active_User
  *@Description To Show the Active Users
  */
  async active_User(req, res) {
    try {
      let activeUser = await MyUserModel.findByIdAndUpdate(req.params.id, {
          status: true
        });
      if (activeUser) {
        console.log("User Activated...");
        res.redirect("/admin/show-user-list");
      }
    }
    catch (err) {
      throw err;
    }
  }


  /**
  *@Method deActive_User
  *@Description To Show the Deactive User
  */
  async deActive_User(req, res) {
    try {
      let deActiveUser = await MyUserModel.findByIdAndUpdate(req.params.id, {
          status: false
        })
      if (deActiveUser) {
        console.log("User Deactivated...");
        res.redirect("/admin/show-user-list");
      }
    }
    catch (err) {
      throw err;
    }
  }

  /**
   * @Method delete_user
   * @Description To Perform Soft Delete
   */
   async delete_user(req, res) {
    try {
      let dataDeleted = await MyUserModel.findByIdAndRemove(req.params.id);
      if (dataDeleted) {
        console.log('Data deleted!!!');
        res.redirect('/admin/show-user-list');
      } else {
        console.log('Data not deleted!!!');
        res.redirect('/admin/show-user-list');
      }
    } catch (err) {
      throw err;
    }
  }


  /**
  *@Method showBanner
  *@Description To Show the Banner
  */
  async showBanner(req, res) {
    try {
      let admin = await MyAdminModel.findOne({_id: req.admin.id});
      res.render("admin/banner", {
        title: "Admin | Add Banner",        
        admin
      })
    }
    catch (err) {
      throw err;
    }
  }


  /**
  *@Method addBanner
  *@Description To Post the Banner
  */
  async addBanner(req, res) {
    try {
      let blogBanner = await MyBannerModel.create(req.body);

      if (blogBanner && blogBanner._id) {
        console.log("text Added...");

        res.redirect("/admin/show-banner-form");
      }
    }
    catch (err) {
      throw err;
    }
  }

  /**
    * @Method listing
    * @Description To Make of Published Blogs
  */

  async listing(req, res) {
    try {
      let admin = await MyAdminModel.findOne({_id: req.admin.id});
      let BlogDetails = await MyBlogModel.aggregate([
        {
          $lookup: {
            from: 'categories',
            let: {
              categoryId: '$category'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ['$_id', '$$categoryId']
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  updatedAt: 0,
                  createdAt: 0
                }
              }
            ],
            as: 'category'
          }
        },
        {
          $unwind: {
            path: '$category'
          }
        },
        {
          $lookup: {
            from: 'users',
            let: {
              userId: '$user'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ['$_id', '$$userId']
                      }
                    ]
                  }
                }
              },
              {
                $project: {
                  updatedAt: 0,
                  createdAt: 0
                }
              }
            ],
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user'
          }
        },

        
    ])

      console.log(BlogDetails);


      res.render('admin/bloglist', {
        BlogDetails, 
        title:"Admin | Table ", 
        admin
      })
    } catch (err) {
      throw err;
    }
  }

  
  /**
 *@Method active_Blog
 *@Description To Show the Active Blog
 */
 async active_Blog(req, res) {
  try {
    let activeBlog = await
      MyBlogModel.findByIdAndUpdate(req.params.id, {
        status: true
      });
    if (activeBlog) {
      console.log("Blog Activated...");
      res.redirect("/admin/show-blog-list");
    }
  }
  catch (err) {
    throw err;
  }
}


/**
*@Method deActive_Blog
*@Description To Show the Deactive Blog
*/
async deActive_Blog(req, res) {
  try {
    let deActiveBlog = await MyBlogModel.findByIdAndUpdate(req.params.id, {
        status: false
      })
    if (deActiveBlog) {
      console.log("Blog Deactivated...");
      res.redirect("/admin/show-blog-list");
    }
  }
  catch (err) {
    throw err;
  }
}


/**
 * @Method delete_blog
 * @Description To Perform  Delete
 */
async delete_blog(req, res) {
  try {
    let dataDeleted = await MyBlogModel.findByIdAndRemove(req.params.id);
    if (dataDeleted) {
      console.log('Data deleted!!!');
      res.redirect('/admin/show-blog-list');
    } else {
      console.log('Data not deleted!!!');
      res.redirect('/admin/show-blog-list');
    }
  } catch (err) {
    throw err;
  }
}



  
  /**
    * @Method commentlisting
    * @Description To Make a Section of Posted Comments
  */

   async commentlisting(req, res) {
    try {
      let admin = await MyAdminModel.findOne({_id: req.admin.id});
      let comment = await MyCommentModel.find().populate("blog")

      console.log(comment);


      res.render('admin/commentlist', {
        comment, title: "Admin | Comments", admin
      })
    } catch (err) {
      throw err;
    }
  }

    /**
 *@Method active_Comment
 *@Description To Show the Active Comment
 */
 async active_Comment(req, res) {
  try {
    let activeComment = await MyCommentModel.findByIdAndUpdate(req.params.id, {
        status: true
      });
    if (activeComment) {
      console.log("Comment Activated...");
      res.redirect("/admin/show-comment-list");
    }
  }
  catch (err) {
    throw err;
  }
}


/**
*@Method deActive_Comment
*@Description To Show the Deactive User
*/
async deActive_Comment(req, res) {
  try {
    let deActiveComment = await MyCommentModel.findByIdAndUpdate(req.params.id, {
        status: false
      })
    if (deActiveComment) {
      console.log("Comment Deactivated...");
      res.redirect("/admin/show-comment-list");
    }
  }
  catch (err) {
    throw err;
  }
}



/**
 * @Method delete_comment
 * @Description To Perform Soft Delete
 */
async delete_comment(req, res) {
  try {

    let dataDeleted = await MyCommentModel.findByIdAndRemove(req.params.id);
    if (dataDeleted) {
      console.log('Data deleted!!!');
      res.redirect('/admin/show-comment-list');
    } else {
      console.log('Data not deleted!!!');
      res.redirect('/admin/show-comment-list');
    }

  } catch (err) {
    throw err;
  }
}



  /**
   * @Method logout
   * @Description To Logout From Dashboard
   */


  async logout(req, res) {
    try {

      res.clearCookie('adminToken')
      console.log('Logged Out Successfully!');
      res.redirect('/admin/');

    } catch (err) {
      throw err;
    }
  }
}

module.exports = new MyAdminController();
