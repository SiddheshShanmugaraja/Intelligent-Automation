 
import thunk from "redux-thunk";
// import logger from "redux-logger";
import promise from "redux-promise-middleware";
import {reducer} from "./reducers";
import {applyMiddleware,createStore} from "redux"


 export default createStore(reducer,applyMiddleware(thunk, promise()));