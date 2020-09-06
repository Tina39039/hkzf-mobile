import React from 'react';

// 导入要使用的组件
import { Button } from 'antd-mobile'

/*配置基础路由
步骤
1.安装：yarn add react-router-dom
2.导入路由组件：Router/Route/Link
3.在pages文件夹中创建Home/index.js和CityList/index.js两个组件
4.使用Route组件配置首页和城市选择页面*/
// 导入路由
import {BrowserRouter as Router,Route,Link,Redirect} from 'react-router-dom'

// 导入首页和城市选择这两个组件（页面）
import Home from './pages/Home'
import CityList from './pages/CityList'




import Map from './pages/Map'

function App() {
  return (
    <Router>
      <div className="App">
        {/*项目根组件<Button>登录</Button>*/}

        {/** 配置导航菜单 */}
        {/*<ul>
          <li><Link to="/home">首页</Link></li>
          <li><Link to="/citylist">城市选择</Link></li>
        </ul>
        */}
        {/** 默认路由重定向 */}
        <Route exact path='/' render={() => <Redirect to='/home' />} />
        
        {/** 配置路由 */}
        {/** Home组件是父路由的内容 */}
        <Route path="/home" component={Home} />
        <Route path="/citylist" component={CityList} />
        <Route path="/map" component={Map} />
      
      </div>
    </Router>
    
  );
}

export default App;
