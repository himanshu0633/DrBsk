// store.js
import { configureStore } from "@reduxjs/toolkit";
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';

const initialState = {
  data: [],
};

const saveState = (data) => {
  localStorage.setItem("reduxState", JSON.stringify(data.data));
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_DATA":
      const newState = {
        ...state,
        data: [...state.data, action.payload],
      };
      saveState(newState);
      return newState;
    case "DELETE_PRODUCT":
      const newState1 = {
        ...state,
        data: state.data.filter((product) => product._id !== action.payload),
      };
      saveState(newState1);
      return newState1;
    case "CLEAR_PRODUCT":
      const newState2 = {
        ...state,
        data: action.payload,
      };
      saveState(newState2);
      return newState2;
    case "CLEAR_ALLPRODUCT":
      const updatedState = {
        ...state,
        data: [],
      };
      saveState(updatedState);
      return updatedState;
    case "UPDATE_DATA":
      const updatedData = state.data.map((product) =>
        product._id === action.payload._id ? action.payload : product
      );
      const newState3 = {
        ...state,
        data: updatedData,
      };
      saveState(newState3);
      return newState3;
    default:
      return state;
  }
};

// Combine reducers (only one here, but necessary for persistReducer)
const root = combineReducers({
  app: rootReducer,
});

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, root);

const store = configureStore({
  reducer: persistedReducer,
});

const persistor = persistStore(store);

export { store, persistor };
