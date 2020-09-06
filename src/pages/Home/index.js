import React from 'react'

/*使用步骤：
1.在pages文件夹中创建 News/index.js 组件
2.在Home组件中，添加一个Route作为子路由（嵌套的路由）的出口
3.设置嵌套路由的path，格式以父路由path开头（父组件展示，子组件才会展示）
4.修改pathname为/home/news，News组件的内容就会展示在Home组件中了
*/
// 2.1 导入路由
import { Route, Redirect } from 'react-router-dom'
// 导入组件自己的样式文件
import './index.css'
// 2.2 导入News组件
import News from '../News'
import Index from '../Index'
import HouseList from '../HouseList'
import Profile from '../Profile'


// 导入TabBar
import { TabBar } from 'antd-mobile';



// TabBar 数据
const tabItems = [
    {
        title:'首页',
        icon:'icon-ind',
        path:'/home'
    },
    {
        title:'找房',
        icon:'icon-findHouse',
        path:'/home/list'
    },
    {
        title:'资讯',
        icon:'icon-infom',
        path:'/home/news'
    },
    {
        title:'我的',
        icon:'icon-my',
        path:'/home/profile'
    }
]

export default class Home extends React.Component {
    state = {
        // 默认选中TabBar菜单项
        selectedTab: this.props.location.pathname,
        // 用于控制TabBar的展示和隐藏。false表示不隐藏
        // hidden: false,
        // 全屏
        // fullScreen: true,
    }

    componentDidUpdate(prevProps){
        if(prevProps.location.pathname !== this.props.location.pathname){
            // 此时，就说明路由发生切换了
            this.setState({
                selectedTab:this.props.location.pathname
            })
        }
    }

    // 渲染每个TabBar.Item内容
    renderTabBarItem(){
        return tabItems.map(item => <TabBar.Item
            title={item.title}
            key={item.title}
            icon={
                <i className={`iconfont ${item.icon}`}></i>
            }
            selectedIcon={
                <i className={`iconfont ${item.icon}`}></i>
            }
            selected={this.state.selectedTab === item.path}
            onPress={() => {
                this.setState({
                    selectedTab: item.path,
                });
                // 路由切换
                this.props.history.push(item.path)
            }}
        />)
    }
    
    render() {
        return (
            <div className="home">
                {/** 2.3渲染子路由 */}
                <Route path="/home/news" component={News} />
                <Route exact path="/home" component={Index} />
                <Route path="/home/list" component={HouseList} />
                <Route path="/home/profile" component={Profile} />


                {/** TabBar */}
                <TabBar
                    noRenderContent={true}
                    tintColor="#21b97a"
                    barTintColor="white"
                >
                    {this.renderTabBarItem()}
                </TabBar>

            </div>
        )
    }
}


