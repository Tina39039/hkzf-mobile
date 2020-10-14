import React from 'react'

import {Flex, Toast} from 'antd-mobile'

import {List,AutoSizer,WindowScroller,InfiniteLoader} from 'react-virtualized'

import {API} from '../../utils/api'
import { BASE_URL} from '../../utils/url'
import {getCurrentCity} from '../../utils'

import SearchHeader from '../../components/SearchHeader'
import Filter from './components/Filter'
import HouseItem from '../../components/HouseItem'

import Sticky from '../../components/Sticky'

import NoHouse from '../../components/NoHouse'
import styles from './index.module.css'

// 获取当前定位城市信息
// const {label,value} = JSON.parse(localStorage.getItem('hkzf_city'))

export default class HouseList extends React.Component {

    state = {
        // 列表数据
        list : [],
        // 总条数
        count : 0,
        // 数据是否加载中
        isLoading : false
    }

    // 初始化默认值
    label = ''
    value = ''

    // 初始化实例属性
    filters = {}

    async componentDidMount(){
        const {label,value} = await getCurrentCity()
        this.label = label
        this.value = value

        this.searchHouseList()

    }

    // 用来获取房屋列表数据
    async searchHouseList(){
        // 获取当前定位城市id
        // const {value} = JSON.parse(localStorage.getItem('hkzf_city'))

        this.setState({
            isLoading : true
        })
        // 开启loading
        Toast.loading('加载中...',0,null,false)

        const res = await API.get('/houses',{
            params : {
                cityId : this.value,
                ...this.filters,
                start : 1,
                end : 20
            }
        })
        const {count,list} = res.data.body

        // 关闭loading
        Toast.hide()

        // 解决没有房源数据也弹框提示的bug
        if(count !== 0){
            // 提示房源数量
             Toast.info(`共找到 ${count} 套房源`,2,null,false)
        }

        this.setState({
            list,
            count,
            // 数据加载完成的状态
            isLoading : false
        })
    }

    // 接收Filter组件中筛选条件数据
    onFilter = (filters) => {
        // 返回页面顶部
        window.scrollTo(0,0)

        this.filters = filters
        // 调用获取房屋数据的方法
        this.searchHouseList()
    }

    // List组件渲染每一行的方法：
    renderHouseList = ({
        key,
        index,
        style, // 注意：重点属性，一定要给每一行数据添加该样式，作用：指定每一行的位置
    }) => {
        // 根据索引号来获取当前这一行的房屋数据
        const {list} = this.state
        const house = list[index]

        // 判断 house 是否存在
        // 如果不存在，就渲染 loading元素占位
        if(!house){
            return (
                <div key={key} style={style}>
                    <p className={styles.loading}></p>
                </div>
            )
        }

        return (
            <HouseItem 
              key={key} 
              onClick={() => this.props.history.push(`/detail/${house.houseCode}`)}
              style={style} 
              src={BASE_URL + house.houseImg}
              title={house.title}
              desc={house.desc}
              tags={house.tags}
              price={house.price}
            ></HouseItem>
        );
    }

    // 判断列表中的每一行是否加载完成
    isRowLoaded = ({ index }) => {
        return !!this.state.list[index];
    }

    // 用来获取更多房屋列表数据
    // 注意：该方法的返回值是一个Promise对象，
    //并且，这个对象应该在数据加载完成时，来调用resolve让Propmise对象的状态变成已完成
    loadMoreRows = ({ startIndex, stopIndex }) => {
        return new Promise(resolve => {
            API.get('/houses',{
                params : {
                    cityId : this.value,
                    ...this.filters,
                    start : startIndex,
                    end : stopIndex
                }
            }).then(res => {
                console.log(res);
                this.setState({
                    list : [...this.state.list,...res.data.body.list]
                })

                // 数据加载完成时，调用resolve即可
                resolve()
            })
            
        })
    }

    /**
     * 找不到房源时的提示 实现步骤：
     * 1.在state中添加一个状态：isLoading 表示数据是否加载中
     * 2.在发送请求之前，设置isLoading的值为true，表示即将要加载数据了
     * 3.在请求完成后，设置isLoading的值为false，表示数据已经加载完成
     * 4.导入NoHouse组件
     * 5.封装renderList方法，来渲染房源列表
     * 6.在方法中，判断查询到的房源数量为0，并且已经count===0 && !isLoading时
     *   提示：没有找到相关内容...
     * 7.否则展示房源列表
     * 
     */
    // 渲染列表数据
    renderList(){
        const {count,isLoading} = this.state
        // 关键点：在数据加载完成后，再进行count的判断
        // 解决方式：如果数据加载中，则不展示NoHouse组件
        // 数据加载完成后再展示NoHouse组件
        if(count === 0 && !isLoading){
            return <NoHouse>没有找到房源，请您换个搜索条件吧</NoHouse>
        }

        return (
            <InfiniteLoader
              isRowLoaded={this.isRowLoaded}
              loadMoreRows={this.loadMoreRows}
              rowCount={count}
            >
                {({onRowsRendered,registerChild}) => (
                    <WindowScroller>
                        {({height,isScrolling,scrollTop}) => (
                            <AutoSizer>
                                {({width}) => (
                                    <List
                                      onRowsRendered={onRowsRendered}
                                      ref={registerChild}
                                      autoHeight //设置高度为WindowScroller最终渲染的列表高度
                                      width={width} //视口的宽度
                                      height={height} //视口的高度
                                      rowCount={count}  //List列表项的条数
                                      rowHeight={120} //每一行的高度
                                      rowRenderer={this.renderHouseList} //渲染列表项中的每一行
                                      isScrolling={isScrolling}
                                      scrollTop={scrollTop}
                                    />
                                )}
                            </AutoSizer>
                        )}
                    </WindowScroller>
                )}
            </InfiniteLoader>

        )
    }
    
    render(){
        const {count} = this.state
        return (
            <div className={styles.root}>
                {/** 顶部搜索导航 */}
                <Flex className={styles.header}>
                    <i 
                      className="iconfont icon-back" 
                      onClick={() => this.props.history.go(-1)}
                    />
                    <SearchHeader cityName={this.label} className={styles.searchHeader} />
                </Flex>

                {/** 条件筛选栏 */}
                <Sticky height={40}>
                    <Filter onFilter={this.onFilter} />
                </Sticky>

                {/** 房屋列表 */}
                <div className={styles.houseItems}>
                   {this.renderList()}
                </div>
            </div>
        )
    }
}
