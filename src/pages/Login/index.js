import React, { Component } from 'react'
import { Flex, WingBlank, WhiteSpace,Toast } from 'antd-mobile'

import { Link } from 'react-router-dom'

// 导入API
import {API} from '../../utils'

import NavHeader from '../../components/NavHeader'

// 导入withFormik
import {withFormik} from 'formik'

import styles from './index.module.css'

// 验证规则：
// const REG_UNAME = /^[a-zA-Z_\d]{5,8}$/
// const REG_PWD = /^[a-zA-Z_\d]{5,12}$/

/*
  登录功能：
    1. 添加状态：username（账号）和password（密码）
    2. 使用受控组件方式获取表单元素值
    3. 给form表单添加onSubmit
    4. 创建方法handleSubmit，实现表单提交
    5. 在方法中，通过username和password获取到账号和密码
    6. 使用API调用登录接口，将username和password作为参数
    7. 判断返回值status为200，表示登录成功
    8. 登录成功后，将token保存到本地存储中（hkzf_token）
    9. 返回登录前的页面
*/
class Login extends Component {
  state = {
    username : '',
    password : ''
  }

  getUserName = (e) => {
    this.setState({
      username : e.target.value
    })
  }

  getPassword = e => {
    this.setState({
      password : e.target.value
    })
  }

  // 表单提交事件处理程序
  handleSubmit = async e => {
    // 阻止表单提交时的默认行为
    e.preventDefault()

    const {username,password} = this.state
    // console.log(username,password);
    // 发送请求
    const res= await API.post('/user/login',{
      username,
      password
    })
    console.log(res);

    const {status,body,description} = res.data

    if(status === 200){
      // 登录成功
      localStorage.setItem('hkf_token',body.token)
      this.props.history.go(-1)
    }else{
      // 登录失败
      Toast.info(description,2,null,false)
    }
  }
  render() {
    const {username,password} = this.state

    // 通过 props 获取到高阶组件传递过来的属性
    const { values,handleSubmit,handleChange} = this.props
    console.log(values,handleSubmit,handleChange);

    return (
      <div className={styles.root}>
        {/* 顶部导航 */}
        <NavHeader className={styles.navHeader}>账号登录</NavHeader>
        <WhiteSpace size="xl" />

        {/* 登录表单 */}
        <WingBlank>
          <form onSubmit={this.handleSubmit}>
            <div className={styles.formItem}>
              <input
                className={styles.input}
                value={values.username}
                onChange={this.getUserName}
                name="username"
                placeholder="请输入账号"
              />
            </div>
            {/* 长度为5到8位，只能出现数字、字母、下划线 */}
            {/* <div className={styles.error}>账号为必填项</div> */}
            <div className={styles.formItem}>
              <input
                className={styles.input}
                value={values.password}
                onChange={this.getPassword}
                name="password"
                type="password"
                placeholder="请输入密码"
              />
            </div>
            {/* 长度为5到12位，只能出现数字、字母、下划线 */}
            {/* <div className={styles.error}>账号为必填项</div> */}
            <div className={styles.formSubmit}>
              <button className={styles.submit} type="submit">
                登 录
              </button>
            </div>
          </form>
          <Flex className={styles.backHome}>
            <Flex.Item>
              <Link to="/registe">还没有账号，去注册~</Link>
            </Flex.Item>
          </Flex>
        </WingBlank>
      </div>
    )
  }
}

// 使用withFormik高阶组件包装Login组件，为Login组件提供属性和方法
Login = withFormik ({
  // 提供状态：
  mapPropsToValues : () => ({ username : '' ,password : '' }),

  // 表单的提交事件
  handleSubmit : () => {}
})(Login)

// 注意：此处返回的是高阶组件包装后的组件

export default Login
