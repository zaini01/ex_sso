import { createStore, applyMiddleware } from "redux";
import myReducer from "./reducers/reducer";
import thunk from "redux-thunk";

const reducer = myReducer;

let store = createStore(reducer, applyMiddleware(thunk));

export default store;
