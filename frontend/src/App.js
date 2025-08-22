import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './views/Login/LoginPage';
import RegisterPage from './views/Register/RegisterPage';
import HomePage from './views/HomePage';
import MainLayout from './layout/MainLayout';
import AndroidList from './views/Android/List';
import AndroidView from './views/Android/View';
import AndroidEdit from './views/Android/Edit';
import AndroidAdd from './views/Android/Add';
import Person from './views/Persion/Person'; 
import Transcations from './views/transcations/Transcations';
import UserList from './views/Users/List';
import UserLayout from './layout/UserLayout/UserLayout'
import UserViewProducts from './views/Android/UserView'
import Chat from './views/Chat/index'
import Possessed from './views/Persion/Possessed'
import SellSecondProduct from './views/Market/Sell'
import IphoneList from './views/IPhone/List'
import Selling from './views/Persion/Selling'
import BlockchainExplorer from './views/Blockchain-explorer/Blockchain-explorer'
import TokenPage from './views/Token/token';
import ProjectView from './views/Products/view'
const isAuthenticated = () => {
  // This function could potentially be replaced or augmented by a context or global state check
  return localStorage.getItem('isAuthenticated');
};

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate replace to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      < Routes >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<UserList />} />
          <Route path="person" element={<Person />} />
          <Route path="userList" element={<UserList />} />
          <Route path="token" element={<TokenPage />} />
          <Route path="transcations" element={<Transcations />} />
          <Route path="iphone" element={<IphoneList />} />
          <Route path="android">
            <Route index element={<AndroidList />} />
            <Route path=":fieldName/:fieldValue" element={<AndroidList />} />
            <Route path="index/:fieldName/:fieldValue" element={<AndroidList />} />
            <Route path="view/:pageid" element={<AndroidView />} />
            <Route path="add" element={<AndroidAdd />} />
            <Route path="edit/:pageid" element={<AndroidEdit />} />
          </Route>
          <Route path='blockchain-explorer' element={<BlockchainExplorer />} />
        </Route>
        <Route path="/user" element={<PrivateRoute><UserLayout /></PrivateRoute>}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="products/view/:pageid" element={<ProjectView />} />
          <Route path="product">
            <Route index element={<UserViewProducts />} />
            <Route path=":fieldName/:fieldValue" element={<AndroidList />} />
            <Route path="index/:fieldName/:fieldValue" element={<AndroidList />} />
            <Route path="view/:pageid" element={<AndroidView />} />
            <Route path="add" element={<AndroidAdd />} />
            <Route path="edit/:pageid" element={<AndroidEdit />} />
    
          </Route>
          <Route path="person" element={<Person />} />
          <Route path="Chat" element={<Chat />} />
          <Route path="possessed" element={<Possessed />} />
          <Route path='sellSecondProduct' element={<SellSecondProduct />} />
          <Route path='selling' element={<Selling />} />
          <Route path='blockchain-explorer' element={<BlockchainExplorer />} />
        </Route>
      </Routes >
    </BrowserRouter>
  );
}

export default App;
