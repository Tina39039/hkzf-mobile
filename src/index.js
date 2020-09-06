import React from 'react';
import ReactDOM from 'react-dom';

// 导入antd-mobile
import 'antd-mobile/dist/antd-mobile.css'

// 导入字体图标库的样式文件
import './assets/fonts/iconfont.css'

import 'react-virtualized/styles.css'
import './index.css';

// 注意：应该将组件的导入放在样式导入的后面，从而避免样式覆盖的问题
import App from './App';

import './utils/url'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

