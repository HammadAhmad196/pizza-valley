import axios from "axios"
export const placeOrder=(token, subtotal)=>async (dispatch, getState)=>{


    dispatch({ type: 'PLACE_ORDER-REQUEST' })
    const currentUser = getState().loginUserReducer.currentUser
    const cartItems = getState().cartReducer.cartItems

    try {
        dispatch({ type: 'PLACE_ORDER-SUCCESS' })
        const response = await axios.post('/api/orders/placeOrder', { token, subtotal, currentUser, cartItems })
        console.log(response)
    } catch (error) {
        dispatch({ type: 'PLACE_ORDER-FAILED' })
        console.log(error)

    }

}


export const getUserOrders=()=>async (dispatch , getState)=>{

    const currentUser = getState().loginUserReducer.currentUser
    dispatch({type: 'GET_USER_ORDERS_REQUEST'})
 
    try{

        const response =await axios.post('/api/orders/getuserorders' , {userid : currentUser._id}) 
        console.log(response)
        dispatch({type: 'GET_USER_ORDERS_SUCCESS', payload: response.data})

    } catch (error) {

        dispatch({type: 'GET_USER_ORDERS_FAILED', payload: error})
    }

}