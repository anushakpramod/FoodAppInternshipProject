const mongoose = require("mongoose")

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Please enter the foodItem name"],
        trim: true,
        maxLength: [100,"foodItem name cannot be more than 100 char"]
    },
    price: {
        type: Number,
        required: [true,"Please enter the price"],
        maxLength: [6,"foodItem price length cannot be more than 6"],
        default: 0.0
    },
    description: {
        type: String,
        required: [true,"Please enter the description"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
        public_id: {
            type: String,
            required: true
        },
        url: {
                type: String,
                required: true
            }
        }
    ],
    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu"
    },
    stock: {
        type: Number,
        required: [true,"please enter food stock count"],
        maxLength: [5,"foodItem stock cannot be more than 5"],
        default: 0
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
     reviews: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            Comment: {
                type: String,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    }

})

module.exports = mongoose.model("FoodItem",foodSchema)