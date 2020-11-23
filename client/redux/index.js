import { createStore, applyMiddleware, combineReducers } from 'redux';
import axios from 'axios';
import thunkMiddleware from 'redux-thunk';

const appReducer = combineReducers({});

const middleware = [
  thunkMiddleware.withExtraArgument({ axios }),
];

export default createStore(
  appReducer,
  applyMiddleware(...middleware),
);
