import React from 'react'
// import axios from 'axios'
import {API} from '../../utils/api'
import { Link } from 'react-router-dom'
import {Toast} from 'antd-mobile'
import {BASE_URL} from '../../utils/url'
// 导入NavHeader组件
import NavHeader from '../../components/NavHeader'
// import './index.scss'
import styles from './index.module.css'
import HouseItem from '../../components/HouseItem'

// 解决脚手架中全局变量访问的问题
const BMap = window.BMapGL
// 覆盖物样式
const labelStyle={
    cursor: 'pointer',
    border:'0px solid rgb(255,0,0)',
    padding:'0px',
    whiteSpace :'nowrap',
    fontSize:'12px',
    color:'rgb(255,255,255)',
    textAlign:'center'
}
export default class Map extends React.Component {
    state = {
        // 小区下的房源列表
        housesList:[],
        // 表示是否展示房源列表
        isShowList:false
    }
    componentDidMount(){
        this.initMap()
    }

    // 初始化地图
    initMap(){
        // 获取当前定位城市
        const {label,value} = JSON.parse(localStorage.getItem('hkzf_city')
        ) 

        // 初始化地图实例
        // 注意：在react脚手架中全局对象需要使用window来访问，否则会造成ESLint校验错误
        const map = new BMap.Map('container')

        // 作用：能够在其他方法中通过this来获取到地图对象
        this.map = map

        // 设置中心点坐标
        // const point = new window.BMapGL.Point(116.404, 39.915);

        // 创建地址解析器实例     
        const myGeo = new BMap.Geocoder();      
        // 将地址解析结果显示在地图上，并调整地图视野    
        myGeo.getPoint(
            label,
            async point => {
              if (point) {
                //  初始化地图
                map.centerAndZoom(point, 11)
                // map.addOverlay(new BMap.Marker(point))
      
                // 添加常用控件
                map.addControl(new BMap.NavigationControl())
                map.addControl(new BMap.ScaleControl())

                // 调用renderOverlays方法
                this.renderOverlays(value)

                // 获取房源数据
                // const res = await axios.get(`http://localhost:8080/area/map?id=${value}`)
                // console.log(res);
                // res.data.body.forEach(item => {
                //     // 为每一条数据创建覆盖物
                //     const {
                //         coord:{longitude,latitude},
                //         label:areaName,
                //         count,
                //         value
                //     } = item
                //     // 创建覆盖物
                //     const areaPoint = new BMap.Point(longitude,latitude)
                //     const opts = {
                //         //指定文本标注所在的地理位置
                //         position : areaPoint,
                //         offset : new BMap.Size(-35,-35)
                //     }
                //     // 创建文本标注对象
                //     const label = new BMap.Label('',opts)

                //     // 给label对象添加唯一的标识
                //     label.id = value
    
                //     // 设置房源覆盖物内容
                //     label.setContent(`
                //         <div class="${styles.bubble}">
                //             <p class="${styles.name}">${areaName}</p>
                //             <p>${count}套</p>
                //         </div>
                //     `)
    
    
                //     label.setStyle(labelStyle)
                //     label.addEventListener('click',() => {
                //         // 放大地图，以当前点击的覆盖物为中心放大地图
                //         // 第一个参数：坐标对象
                //         // 第二个参数：放大级别
                //         map.centerAndZoom(areaPoint,13)
                //         // 清除当前覆盖物信息
                //         map.clearOverlays()
                //     })

                //     map.addOverlay(label)

                // })
                


              }
            },
            label
        )

        // 地图初始化，同时设置地图展示级别
        // map.centerAndZoom(point, 15); 

        // 给地图绑定移动事件
        map.addEventListener('movestart',() => {
            if (this.state.isShowList){
                this.setState({
                    isShowList:false
                })
            }
        })
    }

    // 渲染覆盖物入口
    // 1. 接收区域id参数，获取该区域下的房源数据
    // 2. 获取房源类型以及下级地图缩放级别
    async renderOverlays(id){
        try {
            // 开启loading
            Toast.loading('加载中...',0,null,false)

            const res = await API.get(`/area/map?id=${id}`)
            // 关闭loading
            Toast.hide()

            const data = res.data.body

            // 调用getTypeAndZoom()方法获取级别和类型
            const {nextZoom,type} = this.getTypeAndZoom()

            data.forEach(item => {
                // 创建覆盖物
                this.createOverlays(item,nextZoom,type)
            })
        }catch(e){
            // 关闭loading
            Toast.hide()
        }
    }

    // 计算要绘制的覆盖物类型和下一个缩放级别
    // 区 --> 11,范围：>= 10 < 12
    // 镇 --> 13,范围：>= 12 < 14
    // 小区 ->15,范围：>= 14 < 16
    getTypeAndZoom(){
        // 调用地图的 getZoom()方法，来获取当前缩放级别
        const zoom = this.map.getZoom()
        let nextZoom,type
        if(zoom >= 10 && zoom < 12){
            // 区
            // 下一个缩放级别
            nextZoom = 13
            // circle 表示绘制圆形覆盖物（区、镇）
            type = 'circle'

        } else if(zoom >= 12 && zoom < 14){
            // 镇
            nextZoom = 15
            type = 'circle'
        } else if(zoom >= 14 && zoom < 16){
            // 小区
            type = 'rect'
        }
        return {
            nextZoom,
            type
        }
    }

    // 创建覆盖物
    createOverlays(data,zoom,type){
        const {
            coord:{longitude,latitude},
            label:areaName,
            count,
            value
        } = data

        // 创建覆盖物
        const areaPoint = new BMap.Point(longitude,latitude)
            
        if (type === 'circle'){
            // 区和镇
            this.createCircle(areaPoint,areaName,count,value,zoom)
        } else {
            // 小区
            this.createRect(areaPoint,areaName,count,value)
        }
    }

    // 创建区、镇覆盖物
    createCircle(point,name,count,id,zoom){
        // 创建覆盖物
        const opts = {
            //指定文本标注所在的地理位置
            position : point,
            offset : new BMap.Size(-35,-35)
        }
        // 创建文本标注对象
        const label = new BMap.Label('',opts)
        // 给label对象添加唯一的标识
        label.id = id
        // 设置房源覆盖物内容
        label.setContent(`
            <div class="${styles.bubble}">
                <p class="${styles.name}">${name}</p>
                <p>${count}套</p>
            </div>
        `)
        label.setStyle(labelStyle)
        label.addEventListener('click',() => {
            // 调用renderOverlays()方法，获取该区域下的房源数据
            this.renderOverlays(id)

            // 放大地图，以当前点击的覆盖物为中心放大地图
            // 第一个参数：坐标对象
            // 第二个参数：放大级别
            this.map.centerAndZoom(point,zoom)
            // 清除当前覆盖物信息
            this.map.clearOverlays()
        })
        this.map.addOverlay(label)
    }

    // 创建小区覆盖物
    createRect(point,name,count,id){
        // 创建覆盖物
        const opts = {
            //指定文本标注所在的地理位置
            position : point,
            offset : new BMap.Size(-50,-28)
        }
        // 创建文本标注对象
        const label = new BMap.Label('',opts)
        // 给label对象添加唯一的标识
        label.id = id
        // 设置房源覆盖物内容
        label.setContent(`
            <div class="${styles.rect}">
                <span class="${styles.housename}">${name}</span>
                <span class="${styles.housenum}">${count}套</span>
                <i class="${styles.arrow}"></i>
            </div>
        `)
        label.setStyle(labelStyle)
        label.addEventListener('click',(e) => {
            this.getHousesList(id)
            // 调用地图panBy()方法，移动地图到中间位置
            /** 公式：
             *  垂直位移：(window.innerHeight - 330) / 2 - target.clientY
             *  水平位移：window.innerWidth / 2 - target.clientX
             */
            // 获取当前被点击项
            const target = e.domEvent.changedTouches[0]
            this.map.panBy(
                window.innerWidth / 2 - target.clientX,
                (window.innerHeight - 330) / 2 - target.clientY
            )
        })
        this.map.addOverlay(label)
    }

    // 获取小区房源数据
    async getHousesList(id){
        try{
            // 开启loading
            Toast.loading('加载中...',0,null,false)

            const res = await API.get(`/houses?cityId=${id}`)
            // console.log(res);

            // 关闭loading
            Toast.hide()

            this.setState({
                housesList : res.data.body.list,
                // 展示房源列表
                isShowList : true
            })
        }catch(e){
             // 关闭loading
             Toast.hide()
        }
    }

    // 封装渲染房屋列表的方法
    renderHousesList(){
        return this.state.housesList.map(item => (
            <HouseItem
              key = {item.houseCode}
              src = {BASE_URL + item.houseImg}
              title = {item.title}
              desc = {item.desc}
              tags = {item.tags}
              price = {item.price}
            />
        ))
    }

    render(){
        return(
            <div className={styles.map}>
                {/** 顶部导航栏组件 */}
                <NavHeader>
                    地图找房
                </NavHeader>
                {/** 地图容器元素 */}
                <div id="container" className={styles.container} />

                {/** 房源列表 */}
                {/** 添加style.show展示房屋列表 */}
                <div className={[
                    styles.houseList,
                    this.state.isShowList ? styles.show : ' '
                ].join(' ')}>
                    <div className={styles.titleWrap}>
                        <h1 className={styles.listTitle}>房屋列表</h1>
                        <Link className={styles.titleMore} to="/home/list">更多房源</Link>
                    </div>

                    <div className={styles.houseItems}>
                        {/* 房屋结构 */}
                        {this.renderHousesList()}
                    </div>
                </div>
           
            </div>
        )
    }
}

