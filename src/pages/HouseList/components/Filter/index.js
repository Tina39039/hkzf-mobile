import React , {Component} from 'react'

import {Spring} from 'react-spring/renderprops'

import FilterTitle from '../FilterTitle'
import FilterPicker from '../FilterPicker'
import FilterMore from '../FilterMore'

// 导入自定义的axios
import {API} from '../../../../utils/api'

import styles from './index.module.css'

// import { logRoles } from '@testing-library/react'

// 标题高亮状态
// true 表示高亮 ，false表示不高亮
const titleSelectedStatus = {
    area: false,
    mode: false,
    price: false,
    more: false
}

// FilterPicker 和 FilterMore 组件的选中值
const selectedValues = {
    area : ['area','null'],
    mode : ['null'],
    price : ['null'],
    more : []
}

export default class Filter extends Component {
    state = {
        titleSelectedStatus,
        // 控制FilterPicker 或 FilterMore 组件的展示或隐藏
        openType: '',
        // 所有筛选条件数据
        filtersData : {},
        // 筛选条件的选中值
        selectedValues
    }

    /**
     * 展示条件筛选对话框后，页面滚动问题：
     * 1. 在componentDidMount中，获取到body，并存储在this中（htmlBody）
     * 2. 在展示对话框的时候，给body添加类 body-fixed
     * 3. 在关闭对话框（取消或确定）的时候，移除body中的类 body-fixed
     */
    componentDidMount(){
        // 获取到body
        this.htmlBody = document.body

        this.getFiltersData()
    }

    // 封装获取所有筛选条件的方法
    async getFiltersData(){
        const {value} = JSON.parse(localStorage.getItem('hkzf_city'))
        const res = await API.get(`/houses/condition?id=${value}`)
        
        this.setState({
            filtersData : res.data.body
        })
    }

    /**
     * 高亮： selectedVal表示当前type的选中值
     * 如果type为area，此时，selectedVal.length !== 2 ||sslectedVal[0] !== 'area',就表示已经有选中值
     * 如果type为mode，此时，selectedVal[0] !== 'null',就表示已经有选中值
     * 如果type为price，此时，selectedVal[0] !== 'null',就表示已经有选中值
     * 如果type为more...
     */

    // 点击标题菜单实现高亮
    // 注意：this指向问题
    onTitleClick = type => {
        // 给body添加样式
        this.htmlBody.className = 'body-fixed'
        const {titleSelectedStatus,selectedValues} = this.state
        // 创建新的标题选中状态对象
        const newTitleSelectedStatus = {...titleSelectedStatus}
        
        // 遍历标题选中状态对象
        // Object.keys() => ['area','mode','price','more']
        Object.keys(titleSelectedStatus).forEach(key=>{
            // key表示数组中的每一项，此处就是每个标题的type值
            if(key === type){
                // 当前标题
                newTitleSelectedStatus[type] = true
                return
            }

            // 其他标题
            const selectedVal = selectedValues[key]
            if(key === 'area' && (selectedVal.length !== 2 || selectedVal[0] !== 'area')){
                newTitleSelectedStatus[key] = true
            } else if (key === 'mode' && selectedVal[0] !== 'null'){
                newTitleSelectedStatus[key] = true
            } else if (key === 'price' && selectedVal[0] !== 'null'){
                newTitleSelectedStatus[key] = true
            } else if (key === 'more' && selectedVal.length !== 0){
                // 更多选择项
                newTitleSelectedStatus[key] = true
            } else {
                newTitleSelectedStatus[key] = false
            }
        })

        this.setState({
            // 展开对话框
            openType : type,
            // 使用新的标题选中状态对象来更新
            titleSelectedStatus : newTitleSelectedStatus
        })

        // this.setState(prevState => {
        //     return {
        //         titleSelectedStatus : {
        //             // 获取当前对象中所有属性的值
        //             ...prevState.titleSelectedStatus,
        //             [type] : true
        //         },

        //         // 展示对话框
        //         openType : type
        //     }
        // })
    }

    // 取消（隐藏对话框）
    onCancel = (type) => {
        this.htmlBody.className = ''
        const {titleSelectedStatus,selectedValues} = this.state
        // 创建新的标题选中状态对象
        const newTitleSelectedStatus = {...titleSelectedStatus}

        const selectedVal = selectedValues[type]
        if(type === 'area' && (selectedVal.length !== 2 || selectedVal[0] !== 'area')){
            newTitleSelectedStatus[type] = true
        } else if (type === 'mode' && selectedVal[0] !== 'null'){
            newTitleSelectedStatus[type] = true
        } else if (type === 'price' && selectedVal[0] !== 'null'){
            newTitleSelectedStatus[type] = true
        } else if (type === 'more' && selectedVal.length !== 0){
            // 更多选择项
            newTitleSelectedStatus[type] = true

        } else {
            newTitleSelectedStatus[type] = false
        }

        this.setState({
            openType : '',
            // 更新菜单高亮状态数据
            titleSelectedStatus : newTitleSelectedStatus,

        })
    }

    // 确定（隐藏对话框）
    onSave = (type,value) => {
        this.htmlBody.className = ''
        const {titleSelectedStatus} = this.state
        // 创建新的标题选中状态对象
        const newTitleSelectedStatus = {...titleSelectedStatus}

        const selectedVal = value
        if(type === 'area' && (selectedVal.length !== 2 || selectedVal[0] !== 'area')){
            newTitleSelectedStatus[type] = true
        } else if (type === 'mode' && selectedVal[0] !== 'null'){
            newTitleSelectedStatus[type] = true
        } else if (type === 'price' && selectedVal[0] !== 'null'){
            newTitleSelectedStatus[type] = true
        } else if (type === 'more' && selectedVal.length !== 0){
            // 更多选择项
            newTitleSelectedStatus[type] = true

        } else {
            newTitleSelectedStatus[type] = false
        }

        const newSelectedValues =  {
            ...this.state.selectedValues,
            // 只更新当前type对应的选中值
            [type]:value
        }
        console.log('最新选中值：',newSelectedValues);
        const {area,mode,price,more} = newSelectedValues

        // 筛选条件数据
        const filters = {}

        // 区域
        const areaKey = area[0]
        let areaValue = 'null'
        if(area.length === 3){
            areaValue = area[2] !== 'null' ? area[2] : area[1]
        }
        filters[areaKey] = areaValue

        // 方式和租金
        filters.mode = mode[0]
        filters.price = price[0]
        
        // 更多筛选条件 more
        filters.more = more.join(',')

        // 调用父组件中的方法，来将筛选条件数据传递给父组件
        this.props.onFilter(filters)

        this.setState({
            openType : '',
            // 更新菜单高亮状态数据
            titleSelectedStatus : newTitleSelectedStatus,

            selectedValues : newSelectedValues
        })
    }

    // 渲染FilterPicker组件的方法
    renderFilterPicker(){
        const {
          openType,
          filtersData:{area,subway,rentType,price},
          selectedValues
        } = this.state

        if(openType !== 'area' && openType !== 'mode' && openType !== 'price'){
            return null
        }

        // 根据openType来拿到当前筛选条件数据
        let data = []
        let cols = 3
        let defaultValue = selectedValues[openType]
        switch (openType){
            case 'area':
                // 获取到区域数据
                data = [area,subway]
                cols = 3
                break;
            case 'mode':
                // 获取到区域数据
                data = rentType
                cols = 1
                break;
            case 'price':
                // 获取到区域数据
                data = price
                cols = 1
                break;
            default :
                break;
    }

        return (
            <FilterPicker 
              key={openType}
              onCancel={this.onCancel} 
              onSave={this.onSave} 
              data={data} 
              cols={cols}
              type={openType}
              defaultValue={defaultValue}
            />
        )
    }

    // 渲染FilterMore组件
    renderFilterMore(){
        const {
          openType,
          selectedValues,
          filtersData:{roomType,oriented,floor,characteristic}
        } = this.state
        if (openType !== 'more') {
            return null
        }

        const data = {
            roomType,oriented,floor,characteristic
        }

        const defaultValue = selectedValues.more

        return (
            <FilterMore 
              data={data} 
              type={openType} 
              onSave={this.onSave}
              onCancel={this.onCancel}
              defaultValue={defaultValue}
            />
        )
    }

    // 渲染遮罩层
    renderMask(){
        const {openType} = this.state

        const isHide = openType === 'more' || openType === ''
        
        return (
            <Spring from={{opacity:0}} to={{opacity: isHide ? 0 : 1}}>
                {props => {
                    // 说明遮罩层已经完成动画效果，隐藏了
                    if(props.opacity === 0){
                        return null
                    }

                    return (
                        <div 
                          style={props} 
                          className={styles.mask} 
                          onClick={() => this.onCancel(openType)}
                        />
                    )
                }}
            </Spring>
        )  
    }

    render(){
        const {titleSelectedStatus} = this.state
        return(
            <div className={styles.root}>
                {/** 前三个菜单的遮罩层 */}
                {this.renderMask()}

                <div className={styles.content}>
                    {/** 标题栏 */}
                    <FilterTitle 
                      titleSelectedStatus={titleSelectedStatus}
                      onClick={this.onTitleClick}
                    />

                    {/** 前三个菜单对应的内容： */}
                    {this.renderFilterPicker()}
                   

                    {/** 最后一个菜单对应的内容： */}
                    {this.renderFilterMore()}

                </div>
            </div>
        )
    }
}