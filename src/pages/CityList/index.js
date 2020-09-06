import React from 'react'
// import { Toast } from 'antd-mobile';
import axios from 'axios'
import {getCurrentCity} from '../../utils'
import {List,AutoSizer} from 'react-virtualized';
import NavHeader from '../../components/NavHeader';
import './index.scss';
// 数据格式化方法
// list:[{},{}]
const formatCityData = (list) => {
    const cityList = {}
    // const cityIndex = []
    // 1.遍历list数组
    list.forEach(item => {
        // 2.获取每一个城市的首字母
        const firstLetter = item.short.substr(0,1)
        // 3.判断cityList中是否有该分类
        if(cityList[firstLetter]){
            // 4.如果有，直接往该分类中push数据
            // cityList[firstLetter] => [{},{}]
            cityList[firstLetter].push(item)
        }else{
            // 5.如果没有，就先创建一个数组，然后将当前城市信息添加到数组中
            cityList[firstLetter] = [item]
        }
    })

    // 获取索引数据
    const cityIndex = Object.keys(cityList).sort()
    return {
        cityList,
        cityIndex
    }
    
}

// 索引（A、B等）的高度
const TITLE_HEIGHT = 36
const NAME_HEIGHT = 50
// 封装处理字母索引的方法
const formatCityIndex = (letter) => {
    switch (letter) {
        case '#':
            return '当前定位'
        case 'hotCity':
            return '热门城市'
        default:
            return letter.toUpperCase()
    }
}

// 列表数据的数据源
// const list = [
//     'Brian Vaughn',
// ];
// 渲染每一行数据的渲染函数  
// 函数的返回值表示最终渲染在页面中的内容
// function rowRenderer({
//     key,
//     index,
//     isScrolling, //当前项是否正在滚动
//     isVisible, //当前项在list中是可见的
//     style, // 注意：重点属性，一定要给每一行数据添加该样式，作用：指定每一行的位置
//     }) {
//     return (
//         <div key={key} style={style}>
//         {list[index]}
//         </div>
//     );
// }

// 接口返回的数据格式
// [{'label':'北京','value':'','pingyin':'beijing','short':'bj'}]
// // 渲染城市列表的数据格式为：
// {a:[{},{}],b:[{},{},...]}
// // 渲染右侧索引的数据格式为：
// ['a','b']

export default class CityList  extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            cityList : {},
            cityIndex : [],
            // 指定右侧字母索引列表高亮的索引号
            activeIndex : 0
        }
        // 创建ref对象
        this.cityListComponent = React.createRef()
    }
    

    async componentDidMount(){
        await this.getCityLst()

        // 调用measureAllRows,提前计算List中每一行的高度，实现scrollToRow的精确跳转
        // 注意：调用时需要保证List组件中已经有数据了，
        // 如果List组件中的数据为空，就会导致调用该方法报错
        // 解决：只要保证这个方法是在获取到数据之后调用即可
        this.cityListComponent.current.measureAllRows()
    }
    // 获取城市列表数据的方法
    async getCityLst(){
        var res = await axios.get('http://localhost:8080/area/city?level=1')
        // console.log(res);
        const {cityList,cityIndex} = formatCityData(res.data.body)

        // 获取热门城市列表数据
        const hotRes = await axios.get('http://localhost:8080/area/hot')
        console.log(hotRes);
        // 将数据添加到cityList中
        cityList['hotCity'] = hotRes.data.body
        // 将索引添加到cityIndex中
        cityIndex.unshift('hotCity')


        // 获取当前定位城市
        const curCity = await getCurrentCity()

        // 将当前定位城市数据添加到cityList中
        cityList['#'] = [curCity]
        // 将当前定位城市的索引添加到cityIndex中
        cityIndex.unshift('#')
        // console.log(cityList,cityIndex,curCity);

        this.setState({
            cityList,
            cityIndex
        })

            
    }

    // List组件渲染每一行的方法：
    rowRenderer = ({
        key,
        index,
        isScrolling, //当前项是否正在滚动
        isVisible, //当前项在list中是可见的
        style, // 注意：重点属性，一定要给每一行数据添加该样式，作用：指定每一行的位置
        }) => {
        // 获取每一行的字母索引
        const {cityIndex,cityList} = this.state
        const letter = cityIndex[index]

        // 获取指定字母索引下的城市列表数据
        // cityList[letter]
        return (
            <div key={key} style={style} className="city">
                <div className="title">{formatCityIndex(letter)}</div>
                {
                    cityList[letter].map(item => <div className="name" key={item.value}>{item.label}</div> )
                }
                
            </div>
        );
    }
    
    // 创建动态计算每一行高度的方法
    getRowHeight = ({index}) => {
        const {cityIndex,cityList} = this.state
        // 索引号 cityIndex[index]
        // 索引号对应的城市列表 cityList[cityIndex[index]]
        return TITLE_HEIGHT + cityList[cityIndex[index]].length * NAME_HEIGHT
    }
   
    // 封装渲染右侧索引列表的方法
    renderCityIndex(){
        // 获取到cityIndex，并遍历其，实现渲染
        return this.state.cityIndex.map((item,index) => 
            <li 
                className="city-index-item"
                key={item}
                onClick={() => {
                    this.cityListComponent.current.scrollToRow(index)
                }}
            >
                <span className={this.state.activeIndex === index ? 'index-active' :''} >
                    {item === 'hotCity' ? '热' : item.toUpperCase()}
                </span>
            </li>)
    }

    // 用于获取List组件中渲染行的信息
    onRowsRendered = ({startIndex}) => {
        if(this.state.activeIndex !== startIndex){
            this.setState({
                activeIndex : startIndex
            })
        }
    }
    render(){
        return(
            <div className="cityList">
                {/** 顶部导航栏 */}
                <NavHeader>城市选择</NavHeader>
                
                
                {/** 城市列表 */}
                <AutoSizer>
                    {({height, width}) => (
                    <List
                        ref={this.cityListComponent}
                        scrollToAlignment='start'
                        width={width}
                        height={height}
                        rowCount={this.state.cityIndex.length}
                        rowHeight={this.getRowHeight}
                        rowRenderer={this.rowRenderer}
                        onRowsRendered={this.onRowsRendered}
                    />
                    )}
                </AutoSizer>

                <ul className="city-index">
                    {this.renderCityIndex()}
                </ul>

            </div>
            
        )
    }
}
