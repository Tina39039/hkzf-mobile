import React from 'react'
import {NavBar} from 'antd-mobile'
import {withRouter} from 'react-router-dom'
import PropTypes from 'prop-types'
import styles from './index.module.css'

/**
注意：默认情况下，只有路由Route直接渲染的组件才能够获取到路由信息（比如：history.go()等）
如果需要在其他组件中获取到路由信息需要通过 withRouter 高阶组件来获取
1. 从 react-router-dom 中导入 withRouter 高阶组件
2. 使用 withRouter 高阶组件包装 NavHeader 组件
   目的：包装后，就可以在组件中获取到当前路由信息了
3. 从 props 中解构出 history 对象
4. 调用 history.go() 实现返回上一页功能
5. 从 props 中解构出 onLeftClick 函数，实现自定义 < 按钮的点击事件
 */
function NavHeader({children,history,onLeftClick,className,rightContent}) {
    // 默认点击行为
    const defaultHeadler = () => history.go(-1)
    return (
        <NavBar
            className={[styles.navBar,className || ''].join(' ')}
            mode="light"
            icon={<i className="iconfont icon-back" />}
            onLeftClick={onLeftClick||defaultHeadler}
            rightContent = {rightContent}
        >
            {children}
        </NavBar>
    )
}
// 添加props校验
NavHeader.propTypes = {
    children : PropTypes.string.isRequired,
    onLeftClick : PropTypes.func
}
// withRouter(NavHeader) 函数的返回值也是一个组件
export default withRouter(NavHeader)

