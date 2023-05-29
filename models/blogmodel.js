const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const blogSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    }, 
    /*
    date: {
        type: Date,
        required: true
    },
    */
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
       default: false
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "category",
        default: null
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "user",
        default: null
    }
   
}, {
    timestamps: true,
    versionKey: false
});

blogSchema.plugin(mongoosePaginate);

module.exports = new mongoose.model('blog', blogSchema);
