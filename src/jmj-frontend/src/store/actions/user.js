import { LOGIN, LOGOUT } from '../types';
import API from "../../utils/API";

export const getUser = () => async dispatch => {
    try{
        const res = await API.get(`/api/user`)
        dispatch( {
            type: LOGIN,
            payload: {
                email: res.data.user.email,
                firstName: res.data.user.first_name,
                lastName: res.data.user.last_name,
                type: res.data.user.type,
            }
        })
    }
    catch(e){
        dispatch( {
            type: LOGOUT
        })
    }
}

export const login = (user) => ({
    type:LOGIN,
    payload: user
});

export const logout = (user) => ({
    type:LOGOUT
});