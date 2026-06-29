import { configureStore } from "@reduxjs/toolkit";
import restaurantReducer from "./slices/restaurantSlice";
import menuReducer from "./slices/menuSlice";
import useReducer  from "./slices/userSlice";
import cartReducer from "./slices/cartSlice";


const store = configureStore({
    reducer : {
        restaurants : restaurantReducer,
         menus: menuReducer,
         user: useReducer,
         cart: cartReducer
    }
})
export default store;