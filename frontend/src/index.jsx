// src/main.jsx 或 src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import { NodePolyfills } from 'vite-plugin-node-polyfills'; // 注意改为具名导入

// 导入 process Polyfill
import process from 'process/browser';

// 导入 Buffer Polyfill
import { Buffer } from 'buffer';

// 将 process 和 Buffer 挂载到全局对象
window.process = process;
window.Buffer = Buffer;

const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );

// 你可以删除 reportWebVitals 或保留这个函数以监测性能
// 如果你删除了 reportWebVitals 文件，确保也删除以下的函数调用
// reportWebVitals();
