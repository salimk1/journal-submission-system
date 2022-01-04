import { LOGIN, LOGOUT } from '../types';


const initialState = {
    email: null,
    firstName: null,
    lastName: null,
    type: null
};
const userReducer = (state = initialState, action) => {

    switch(action.type){
        case LOGIN:
        return {
            ...state,
            ...action.payload,
        }
        case LOGOUT:
        return {
            ...state,
            email: null,
            firstName: null,
            lastName: null,
            type: null
        }
        default: return state
    }
};

export default userReducer;