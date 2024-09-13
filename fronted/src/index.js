import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 如果你没有定义 reportWebVitals，可以删除这部分
// import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 你可以删除 reportWebVitals 或保留这个函数以监测性能
// 如果你删除了 reportWebVitals 文件，确保也删除以下的函数调用
// reportWebVitals();
