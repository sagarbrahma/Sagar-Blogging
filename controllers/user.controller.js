const UserModel = require("../models/usermodel");
const BlogModel = require("../models/blogmodel");
const CommentModel = require('../models/CommentModel');
const CategoryModel = require("../models/categorymodel");
const BannerModel = require("../models/bannermodel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');


class UserController {

  constructor() { }


  /**
   * @Method userAuthentication
   * @Description Checking User Authentication 
   */

  async userAuthentication(req, res, next) {
    try {
      if (req.user) {
        console.log(req.user);
        next()
      } else {
        res.redirect('/show-user-registration-form')
      }
    } catch (err) {
      throw err;
    }
  }


  /**
   * @Method index
   * @Description To Show The Index Page
   */

  async index(req, res) {
    try {
      const pager = req.query.page ? req.query.page : 1;

      const options = {
        populate: "user",
        page: pager,
        limit: 2,
        sort: '-createdAt',
        collation: {
          locale: 'en',
        },
      };

      let data = await BlogModel.paginate({}, options);
      if (data) {
        console.log(data.docs);
        let result = await BlogModel.find().populate("user").sort('-createdAt').limit(5).exec();
        console.log("SB", result);

        let category = await CategoryModel.find().exec();
        if (category) {

          let comment = await CommentModel.find().sort('-createdAt').limit(5);
          if (comment) {
            let banners = await BannerModel.find();
            if (banners) {
              res.render("homepage", {
                title: "Sagar's Blog | Home",
                data: req.user,
                displayData: data,
                pager: pager,
                result: result,
                comment: comment,
                category: category,
                banner: banners
              })
            }

          }
        }


      } else {
        console.log("error while fetching category for index page");
      }
    }

    catch (err) {
      throw err;
    }
  }



  /**
   * @Method showRegistrationPage
   * @Description showing registration page
   */
  async showRegistrationPage(req, res) {
    try {
      res.render("register", {
        title: "User || Registration",
        data: req.user,
        message: req.flash("message"),
        alert: req.flash("alert"),

      })
    } catch (err) {
      throw err;
    }
  }

  /**
   * @Method userRegistration
   * @Description To Submit And Perform Logical Stuff In Registration Form
  */

  async userRegistration(req, res) {
    try {
      let emailAlreadyExists = await UserModel.find({email: req.body.email});

      if(emailAlreadyExists.length){
        console.log('user already exits!');
        req.flash("message", "user already exists!");
        req.flash("alert", "error-msg");
        res.redirect("/show-user-registration-form");
      }else{
        
        if (req.file && req.file.filename) {
        req.body.image = req.file.filename;
      }
      console.log(req.file);
      req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));

      let saveData = await UserModel.create(req.body);
      console.log(saveData);

      if (saveData && saveData._id) {
        console.log("User Added...");
        req.flash("message", "Successfully Registered");
        req.flash("alert", "success-msg");
        res.redirect("/show-login");
      } else {
        req.flash("message", "Something Went Wrong!!!");
        req.flash("alert", "error-msg");
        console.log("User Not Added...");
        res.redirect("/show-user-registration-form");
      }
    }    
  }
    catch (err) {
      throw err;
    }
  }


  /**
   * @Method showLoginPage
   * @Description To Show The Login Page
   */
  async showLoginPage(req, res) {
    try {
      res.render("user_index", {
        title: "User || Login",
        data: req.user,
        message: req.flash("message"),
        alert: req.flash("alert")
      });
    } catch (err) {
      throw err;
    }
  }


  /**
   *  @Method userLogin
   *  @Description To Perform Login Operations 
  */

  async userLogin(req, res) {
    try {

      let data = await UserModel.findOne({ email: req.body.email });
      if (data) {
        if (data.status) {
          const hashPassword = data.password;
          if (bcrypt.compareSync(req.body.password, hashPassword)) {
            const token = jwt.sign({
              id: data._id,
              username: data.userName,
              email: data.email
            }, 'B1U2M3B4A5', { expiresIn: '5h' });
            res.cookie("userToken", token);
            if (req.body.rememberme) {
              res.cookie('email', req.body.email)
              res.cookie('password', req.body.password)
            }
            console.log(data);
            res.redirect("/show-blog-section-form");
          } else {
             console.log("Invalid Password...");
             res.redirect("/");
              req.flash("message", "Invalid Password");
            req.flash("alert", "error-msg");
            res.redirect("login");
          }
        } else {
           console.log("Account Is Not Verified");
          req.flash("message", "Account Is Not Verified");
          req.flash("alert", "error-msg");
          res.redirect("login");
        }
      } else {
         console.log("Invalid Email...");
         res.redirect("/");
        req.flash("message", "Invalid Email");
        req.flash("alert", "error-msg");
        res.redirect("login");
      }

    } catch (err) {
      throw err;
    }
  }



  /**
   * @Method createBlog
   * @Description To Create the blog
  */

  async createBlog(req, res) {
    try {
      let allUser = await UserModel.find({});
      let allcategorydetails = await CategoryModel.find({});
      res.render('blog_form', {
        title: "User || Blogging Form", allcategorydetails, allUser,
        data: req.user,
        message: req.flash("message"),
        alert: req.flash("alert"),
      })
    } catch (err) {
      throw err;
    }
  }


  /**
   * @Method insertBlog
   * @Description To insert the DATA inside blog_section_form
  */

  async insertBlog(req, res) {
    try {
      console.log(req.user);
      req.body.user = req.user.id;
     

      if (req.file && req.file.filename) {
        req.body.image = req.file.filename;
      }

      console.log(req.file);

      let saveData = await BlogModel.create(req.body);
      console.log(saveData);

      if (saveData && saveData._id) {
        console.log('Saved Successfully');
        res.redirect('/show-manage-form');
        req.flash("message", "Post Added");
        req.flash("alert", "success-msg");

      } else {
        console.log('Data is not saved');
        res.redirect('/show-blog-section-form');
        req.flash("message", "Something Went Wrong!!!");
        req.flash("alert", "error-msg");

      }

    }

    catch (err) {
      throw err;

    }
  }

  /**
   * @Method viewPost
   * @Description to view the posts on homepage
   */
  async viewPost(req, res) {
    try {

     
      let result = await BlogModel.find({_id: req.params.id}).populate("category").populate("user");
      if (result) {
        console.log(result);
        let data = await CommentModel.find().populate("blog")
        if (data) {
          console.log(data);

          let banner = await BannerModel.find();
          if (banner) {
            res.render("viewpost", {
              title: "Sagar's Blog | View Post",
              displayData: result,
              data: req.user,
               message: req.flash("message"),
               alert: req.flash("alert"),
              comment: data,
              banner: banner
            })

          }
        } else {
          console.log('Something Wrong happened!');
          req.flash("message", "Something Went Wrong!!!");
          req.flash("alert", "error-msg");
        }
      }
    } catch (error) {
      throw error;

    }
  }


  /**
   * @Method addComment
   * @Description to add commnets
   */
  async addComment(req, res) {
    try {
     
      let addcomment = await CommentModel.create(req.body);
      console.log(addcomment);
      if (addcomment && addcomment._id) {
        console.log('comment added');
        req.flash("message", "Comment Added Successfully, Wait For Approval");
        req.flash("alert", "success-msg");
        res.redirect(`/viewpost/${req.body.id}`);
      } else {
        console.log('adding failed');
        res.redirect('/viewpost');
        req.flash("message", "Something Went Wrong!!!");
        req.flash("alert", "error-msg");
      }
    } catch (error) {
      throw error;

    }
  }


  /**
      * @Method managePost 
      * @Description To managePost
     */

  async managePost(req, res) {
    try {

      let allBlog = await BlogModel.find().populate('user');

      console.log(allBlog);

      if (allBlog) {
       // console.log(req.cookies.email);
        res.render('manageblog', {
          allBlog,
          data: req.user,
          flag: req.user.email,
          title: "User || Manage Posts"
        })
      }

    } catch (err) {
      throw err;
    }
  }

  /**
     * @Method showUpdatePost
     * @Description To showUpdatePost
    */
  async showUpdatePost(req, res) {
    try {
     
      let bloggersData = await BlogModel.findById(req.params.id).populate("category");
        let category = await CategoryModel.find();
            res.render("updatepost", {
                title: "Update Post",
                data: req.user,
                message: req.flash("message"),
                alert: req.flash("alert"),
                category: category,
                result: bloggersData
            })




    } catch (err) {
      throw err;
    }
  }

  /**
     * @Method updatePost
     * @Description To updatePost
    */

  async updatePost(req, res) {
    try {


      let oldData = await BlogModel.findOne({ _id: req.body.id });

      if (req.file && req.file.filename) {
        req.body.image = req.file.filename;
        fs.unlinkSync(`./public/uploads/${oldData.image}`);
      }

      let dataUpdate = await BlogModel.findByIdAndUpdate(req.body.id, req.body);

      if (dataUpdate && dataUpdate._id) {
        console.log('Data Updated!!!!');
        req.flash("message", "Post Updated Successfully");
        req.flash("alert", "success-msg");
        res.redirect('/show-manage-form');
      } else {
        console.log('Data not updated');
        res.redirect('/show-manage-form');
        req.flash("message", "Something Went Wrong!!!");
        req.flash("alert", "error-msg");
      }
    } catch (err) {
      throw err;
    }
  }

  /**
     * @Method deletePost
     * @Description To deletePost
    */
  async deletePost(req, res) {
    try {
      let result = await BlogModel.findByIdAndUpdate(req.params.id);
      if (result) {
        console.log('deleted');
        res.redirect('/show-manage-form');
        req.flash("message", "Post Delted Successfully");
        req.flash("alert", "success-msg")
      } else {
        console.log('Data not updated');
        res.redirect('/show-manage-form');
        req.flash("message", "Something Went Wrong!!!");
        req.flash("alert", "error-msg");
      }
    } catch (err) {
      throw err;
    }
  }


  /**
     * @Method contactform
     * @Description To get Contact
    */

  async contactform(req, res) {
    try {
      res.render("contact", {
        title: "Contact Us",
         message: req.flash("message"),
        alert: req.flash("alert"),
        data: req.user
      })
    } catch (err) {
      throw err;
    }
  }

  /**
     * @Method contact
     * @Description To contact
    */

  async contact(req, res) {
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: "sagarbrahma742@gmail.com",
          pass: "sdgkmlngfpgomppn"
        }
      });
      let mailOptions = {
        from: 'no-reply@Sagar.com',
        to: 'sagarbrahma742@gmail.com',
        subject: "Query From Sagar's Blogging",
        text: `Greetings From ${req.body.name}
      Query - ${req.body.message}
      Email - ${req.body.email}
      Contact - ${req.body.contact}`
      };
      transporter.sendMail(mailOptions, function (err) {
        if (err) {
          console.log("Techniclal Issue...");
          req.flash("message", "Something Went Wrong!!!");
          req.flash("alert", "error-msg");
        } else {
          req.flash("message", "Message Sent Successfully...");
          req.flash("alert", "success-msg");
          res.redirect("/show-contact-us-form");
          console.log("Message Sent Successfully...");
        }
      });
    } catch (err) {
      throw err;
    }
  }

  /**
       * @Method forgot
       * @Description To forgot
      */

  async forgot(req, res) {
    try {
      res.render("forgot", {
        title: "Forgot Password",
        data: req.user,
         message: req.flash("message"),
        alert: req.flash("alert"),
      })
    } catch (err) {
      throw err;
    }
  }


  /**
     * @Method getLink 
     * @Description To getLink 
    */

  async getLink(req, res) {
    try {
      let email = await UserModel.findOne({ email: req.body.email });

      if (email) {
        console.log(email, "Email found...");
        let forgotToken = crypto.randomBytes(16).toString('hex');
        let result = await UserModel.findOneAndUpdate({ email: req.body.email }, {
          forgotToken: forgotToken
        });
        if (result) {
          console.log("forgotToken set...");
          var transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
              user: "sagarbrahma742@gmail.com",
              pass: "sdgkmlngfpgomppn"
            }
          });
          var mailOptions = {
            from: 'no-reply@Sagar.com',
            to: email.email,
            subject: 'Reset Password',
            text: 'Hello ' + email.userName + ',\n\n' + 'Please forgot your password by clicking the link: \nhttp:\/\/' + req.headers.host +'\/resetpassword\/'+ email.email + '\/' + forgotToken + '\n\nThank You!\n'
          };
          transporter.sendMail(mailOptions, function (err) {
            if (err) {
              console.log("Techniclal Issue...");
            } else {
             req.flash("message", "A Forgot Email Sent To Your Mail ID.... Please Change Your Password By Click The Link....");
              req.flash("alert", "success-msg");
              res.redirect("/forgot");

            }
          });
        }
      } else {
        console.log("email not found while execute getLink()");
         req.flash("message", "Email Not Found");
         req.flash("alert", "error-msg");
         res.redirect("/forgot");
      }
    }
    catch (err) {
      throw err;
    }
  }

  /**
     * @Method resetPassword 
     * @Description To resetPassword 
    */



  async resetPassword(req, res) {
    try {
      let data = await UserModel.findOne({ forgotToken: req.params.forgottoken });
     
        res.render("resetpassword", {
          title: "Reset Password",
          data: data,
          message: req.flash("message"),
          alert: req.flash("alert")
        })
      
    }
    catch (err) {
      throw err;
    }
  }

  /**
     * @Method reset 
     * @Description To reset
    */


  async reset(req, res) {
    try {
      if (req.body.password === req.body.confirmpassword) {
        req.body.password= bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
        let result = await UserModel.findByIdAndUpdate(req.body.id, req.body);

        if (result && result._id) {
          console.log("Password Updated...");
           req.flash("message", "Password Updated Successfully");
          req.flash("alert", "success-msg");
          res.redirect("/show-login");
        } else {
          req.flash("message", "Something Went Wrong!!!");
          req.flash("alert", "error-msg");
          console.log("Password Not Changed...");
           res.redirect("/show-login");
        }
      } else {
        console.log("Password & Confirm Password Not Same");
        req.flash("message", "Password & Confirm Password Not Same");
        req.flash("alert", "error-msg");
         res.redirect("/show-login");
      }
    } catch (err) {
      throw err;
    }
  }


   /**
   * @Method fetchProducts
   * @Description fetchproducts
   */
    async fetchProducts (req, res)  {
      try{
        let blogresult = await BlogModel.find({ category: req.body.catId }).populate("user");
          res.send(blogresult)
      }
      catch(err){
        throw err;
      }
    }

  
  /**
   * @Method logout
   * @Description To Logout
   */


   async logout(req, res) {
    try {

      res.clearCookie('userToken')
      console.log('Logged Out Successfully!');
      res.redirect('/');

    } catch (err) {
      throw err;
    }
  }

}

module.exports = new UserController();

