import axios from 'axios'
// 步骤：
// 1)在utils目录中，新建index.js，在该文件中封装
// 2)创建并导出获取定位城市的函数getCurrentCity
export const getCurrentCity = () => {
    // 3)判断localStorage中是否有定位城市
    const localCity = JSON.parse(localStorage.getItem('hkzf_city'))
    if(!localCity){
        // 4)如果没有就使用首页中获取定位城市的代码来获取，并且存储到本地存储中，然后返回该城市数据
        // 通过IP定位获取到当前城市名称
        return new Promise((resolve,reject) => {
            const curCity = new window.BMapGL.LocalCity()
            curCity.get(async res => {
                try{
                    // console.log('当前城市信息：',res);
                    const result = await axios.get(`http://localhost:8080/area/info?name=${res.name}`)
                    // 存储到本地存储中
                    localStorage.setItem('hkzf_city',JSON.stringify(result.data.body))
                    // 返回该城市数据
                    resolve(result.data.body)
                }catch(e){
                    // 获取定位城市失败
                    reject(e)
                }
                
            })
        })
    }
    // 5)如果有，直接返回本地存储中的城市数据
    // 注意：因为上面为了处理异步操作使用了promise，因此，为了该函数返回值统一，此处也应该使用Promise
    // 因为此处的Promise不会失败，所以此处只要返回一个成功的Promise即可
    return Promise.resolve(localCity)
}
