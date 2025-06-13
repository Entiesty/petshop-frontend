<template>
  <div class="home-container">
    <!-- 头部 -->
    <header class="header">
      <div class="title">萌宠情报局</div>
      <div class="search-box">
        <input type="text" v-model="searchKeyword" placeholder="搜索宠物或周边商品..." @keyup.enter="searchProducts" />
        <button class="search-btn" @click="searchProducts">搜索</button>
      </div>
      <div class="user-actions">
        <router-link to="/ai-assistant" class="ai-icon">
          <el-icon><ChatDotRound /></el-icon>
        </router-link>
        <div class="user-menu" v-if="isLoggedIn">
          <el-dropdown>
            <span class="user-icon">
              <el-icon><User /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                <el-dropdown-item @click="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <router-link v-else to="/login" class="user-icon">
          <el-icon><User /></el-icon>
        </router-link>
        <router-link to="/cart" class="cart-icon">
          <el-icon><ShoppingCart /></el-icon>
        </router-link>
      </div>
    </header>

    <!-- 宠物分类 -->
    <div class="pet-categories">
      <div class="category-item" v-for="category in petCategories" :key="category.id" @click="filterByCategory(category.id)">
        <div class="category-icon">
          <img :src="category.iconUrl" :alt="category.name">
        </div>
        <div class="category-name">{{ category.name }}</div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 热门宠物推荐 -->
      <div class="content-section">
        <div class="section-title">热门宠物推荐</div>
        <div class="hot-pets">
          <div class="pet-card" v-for="pet in hotPets" :key="pet.id" @click="viewProductDetail(pet.id)">
            <div class="pet-image">
              <img :src="pet.imageUrl" :alt="pet.name">
            </div>
            <div class="pet-info">
              <div class="pet-name">{{ pet.name }}</div>
              <div class="pet-desc">{{ pet.description }}</div>
              <div class="pet-price">¥{{ pet.price }}</div>
              <button class="detail-btn" @click.stop="viewProductDetail(pet.id)">查看详情</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 限时促销 -->
      <div class="content-section" v-if="promotions.length > 0">
        <div class="section-title">限时促销</div>
        <div class="promotions">
          <div class="promotion-card" v-for="promotion in promotions" :key="promotion.id" @click="viewProductDetail(promotion.id)">
            <div class="promotion-image">
              <img :src="promotion.imageUrl" :alt="promotion.name">
              <div class="discount-badge" v-if="promotion.discount">
                {{ Math.round((1 - promotion.discount) * 100) }}% OFF
              </div>
            </div>
            <div class="promotion-info">
              <div class="promotion-name">{{ promotion.name }}</div>
              <div class="promotion-desc">{{ promotion.description }}</div>
              <div class="promotion-price">
                <span class="current-price">¥{{ typeof promotion.currentPrice === 'number' ? promotion.currentPrice.toFixed(2) : promotion.currentPrice }}</span>
                <span class="original-price">¥{{ typeof promotion.originalPrice === 'number' ? promotion.originalPrice.toFixed(2) : promotion.originalPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 附近店铺 -->
      <div class="content-section">
        <div class="section-title">
          <div class="title-content">
            <span>附近店铺</span>
            <div class="location-info">
              <el-icon class="location-icon"><LocationFilled /></el-icon>
              <span class="location-text">{{ locationMethod }}</span>
              <el-button 
                type="primary" 
                size="small" 
                @click="showLocationSelector"
                class="location-selector-btn"
              >
                <el-icon><Pointer /></el-icon>
                选择位置
              </el-button>
            </div>
          </div>
        </div>
        <div class="nearby-stores">
          <div v-if="nearbyStores.length === 0" class="empty-state">
            <div class="empty-icon">🏪</div>
            <div class="empty-title">暂无附近店铺</div>
            <div class="empty-description">
              没有找到您附近的宠物店铺，您可以：
            </div>
            <div class="empty-actions">
              <el-button type="primary" @click="showLocationSelector" round>
                <el-icon><Pointer /></el-icon>
                选择其他位置
              </el-button>
              <el-button @click="fetchNearbyStores" round>
                <el-icon><Refresh /></el-icon>
                重新定位
              </el-button>
            </div>
          </div>
          <div class="store-card" v-for="store in nearbyStores" :key="store.id">
            <div class="store-image">
              <img :src="store.imageUrl || '@/assets/homelogo.png'" :alt="store.name">
            </div>
            <div class="store-info">
              <div class="store-name">{{ store.name }}</div>
              <div class="store-address">{{ store.address }}</div>
              <div class="store-distance">{{ store.distance }}km</div>
              <div class="store-hours">营业时间: {{ store.businessHours }}</div>
              <div class="store-actions">
                <button class="map-btn" @click="showStoreLocation(store)">查看地图</button>
                <button class="detail-btn" @click="viewStoreDetail(store.id)">查看详情</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="bottom-nav">
      <div class="nav-item active">
        <i class="nav-icon">
          <el-icon><HomeFilled /></el-icon>
        </i>
        <span>首页</span>
      </div>
      <div class="nav-item">
        <router-link to="/cart">
          <i class="nav-icon">
            <el-icon><ShoppingCart /></el-icon>
          </i>
          <span>购物车</span>
        </router-link>
      </div>
      <div class="nav-item">
        <router-link to="/user">
          <i class="nav-icon">
            <el-icon><User /></el-icon>
          </i>
          <span>个人中心</span>
        </router-link>
      </div>
    </div>

    <!-- 地图弹窗 -->
    <el-dialog v-model="mapDialogVisible" title="店铺位置" width="80%">
      <div class="map-container" ref="mapContainer" style="height: 400px;"></div>
    </el-dialog>

    <!-- 位置选择器弹窗 -->
    <el-dialog v-model="locationSelectorVisible" title="选择您的位置" width="500px">
      <div style="margin-bottom: 20px;">
        <p style="color: #666; font-size: 14px;">
          如果自动定位不准确，请手动选择您所在的城市：
        </p>
      </div>
      
          <div class="location-grid">
        <div 
          v-for="location in presetLocations" 
          :key="location.name"
          class="location-item"
          @click="selectPresetLocation(location)"
        >
          <div class="location-name">{{ location.name }}</div>
          <div class="location-coords">{{ location.lng }}, {{ location.lat }}</div>
        </div>
      </div>
      
      <div style="margin-top: 20px; text-align: center;">
        <el-button @click="locationSelectorVisible = false">取消</el-button>
        <el-button type="primary" @click="getUserLocation">重新定位</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { User, ShoppingCart, HomeFilled, ChatDotRound, LocationFilled, Pointer, Refresh } from '@element-plus/icons-vue'
import { TOKEN_KEY } from '../config'

// 扩展Window接口以包含AMap
declare global {
  interface Window {
    AMap: any;
    createAiChat: (options: { appId: string; iconPosition: string }) => void;
  }
}

interface StoreData {
  id: number;
  name: string;
  address: string;
  distance: number;
  businessHours: string;
  imageUrl: string;
  longitude: number;
  latitude: number;
}

interface CategoryData {
  id: number;
  name: string;
  iconUrl: string;
  sortOrder?: number;
}

const router = useRouter()
const searchKeyword = ref('')
const mapDialogVisible = ref(false)
const mapContainer = ref(null)
const selectedStore = ref<StoreData | null>(null)
const userLocation = ref({ lng: 116.404, lat: 39.915 }) // 默认位置（北京）
const locationSelectorVisible = ref(false)
const locationAccuracy = ref<number>(0) // 定位精度
const locationMethod = ref<string>('默认') // 定位方法

// 计算是否在厦门地区
const isInXiamen = computed(() => {
  return userLocation.value.lng > 118 && userLocation.value.lng < 124 && 
         userLocation.value.lat > 24 && userLocation.value.lat < 26
})

// 检查登录状态
const isLoggedIn = computed(() => {
  return !!localStorage.getItem(TOKEN_KEY)
})

// 退出登录
const logout = () => {
  // 清除所有本地存储的用户信息
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  
  // 清除axios默认请求头
  delete axios.defaults.headers.common['Authorization']
  
  ElMessage.success('已退出登录')
  
  // 跳转到登录页
  router.push('/login')
}

// 跳转到个人中心
const goToProfile = () => {
  router.push('/user')
}

// 宠物分类
const petCategories = ref<CategoryData[]>([])

// 获取商品分类
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/user/categories')
    
    if (response.data && Array.isArray(response.data)) {
      // 转换响应数据格式，只获取一级分类（parentId为null或0的分类）
      petCategories.value = response.data
        .filter((category: any) => !category.parentId || category.parentId === 0)
        .map((category: any) => ({
          id: category.id,
          name: category.name,
          iconUrl: category.iconUrl || '@/assets/homelogo.png',
          sortOrder: category.sortOrder
        }))
        .sort((a: CategoryData, b: CategoryData) => (a.sortOrder || 0) - (b.sortOrder || 0)) // 按排序字段排序
    }
  } catch (error) {
    console.error('获取分类数据失败:', error)
    // 错误时设置为空数组，不使用默认数据
    petCategories.value = []
  }
}

// 热门宠物
const hotPets = ref([])

// 促销商品
const promotions = ref([])

// 附近店铺
const nearbyStores = ref([])

// 搜索商品
const searchProducts = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  // 调用搜索API
  router.push({
    path: '/search',
    query: { keyword: searchKeyword.value }
  })
}

// 按分类过滤
const filterByCategory = (categoryId: number) => {
  router.push(`/category/${categoryId}`)
}

// 查看商品详情
const viewProductDetail = (productId: number) => {
  router.push(`/product/${productId}`)
}

// 查看店铺详情
const viewStoreDetail = (storeId: number) => {
  router.push(`/store/${storeId}`)
}

// 显示店铺位置地图
const showStoreLocation = (store: any) => {
  selectedStore.value = store
  mapDialogVisible.value = true
  
  // 在对话框显示后渲染地图
  setTimeout(() => {
    if (window.AMap && mapContainer.value) {
      renderMap()
    } else {
      ElMessage.warning('地图服务暂不可用')
    }
  }, 300)
}

// 渲染地图
const renderMap = () => {
  if (!window.AMap || !mapContainer.value || !selectedStore.value) return
  
  const map = new window.AMap.Map(mapContainer.value, {
    zoom: 15,
    center: [selectedStore.value.longitude, selectedStore.value.latitude]
  })
  
  // 添加店铺标记
  new window.AMap.Marker({
    position: [selectedStore.value.longitude, selectedStore.value.latitude],
    title: selectedStore.value.name,
    map: map
  })
  
  // 添加用户位置标记
  new window.AMap.Marker({
    position: [userLocation.value.lng, userLocation.value.lat],
    title: '我的位置',
    icon: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
    map: map
  })
  
  // 添加两点间的路线
  const driving = new window.AMap.Driving({
    map: map,
    panel: false
  })
  
  driving.search(
    [userLocation.value.lng, userLocation.value.lat],
    [selectedStore.value.longitude, selectedStore.value.latitude]
  )
}

// 获取用户位置
const getUserLocation = () => {
  console.log('开始获取用户位置...')
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('获取位置成功:', position.coords)
        console.log('用户真实坐标 - 经度:', position.coords.longitude, '纬度:', position.coords.latitude)
        
        userLocation.value = {
          lng: position.coords.longitude,
          lat: position.coords.latitude
        }
        locationAccuracy.value = position.coords.accuracy || 0
        locationMethod.value = 'GPS定位'
        
        console.log('更新用户位置为:', userLocation.value)
        console.log('用户位置详细信息 - 经度:', userLocation.value.lng, '纬度:', userLocation.value.lat)
        fetchNearbyStores()
      },
      (error) => {
        console.error('获取位置失败:', error)
        console.log('使用默认位置（北京天安门）:', userLocation.value)
        locationMethod.value = '默认位置'
        fetchNearbyStores() // 使用默认位置获取店铺
      },
      {
        timeout: 10000, // 10秒超时
        enableHighAccuracy: true, // 高精度
        maximumAge: 300000 // 5分钟内的位置缓存有效
      }
    )
  } else {
    console.error('浏览器不支持地理位置服务')
    console.log('使用默认位置（北京天安门）:', userLocation.value)
    locationMethod.value = '浏览器不支持'
    fetchNearbyStores() // 使用默认位置获取店铺
  }
}

// 显示位置选择器
const showLocationSelector = () => {
  locationSelectorVisible.value = true
}

// 选择预设位置
const selectPresetLocation = (location: { lng: number, lat: number, name: string }) => {
  console.log('用户手动选择位置:', location.name, location)
  userLocation.value = { lng: location.lng, lat: location.lat }
  locationAccuracy.value = 0
  locationMethod.value = `手动选择(${location.name})`
  locationSelectorVisible.value = false
  fetchNearbyStores()
}

// 预设城市位置
const presetLocations = [
  { lng: 118.094, lat: 24.479, name: '厦门市' },
  { lng: 121.473, lat: 31.231, name: '上海市' }, 
  { lng: 116.404, lat: 39.915, name: '北京市' },
  { lng: 113.264, lat: 23.129, name: '广州市' },
  { lng: 114.314, lat: 22.543, name: '深圳市' },
  { lng: 120.153, lat: 30.287, name: '杭州市' },
  { lng: 118.767, lat: 32.041, name: '南京市' },
  { lng: 104.066, lat: 30.572, name: '成都市' }
]

// 从API获取附近店铺
const fetchNearbyStores = async () => {
  try {
    console.log('正在获取附近店铺，用户位置:', userLocation.value)
    
    const response = await axios.get('/api/user/stores/nearby', {
      params: {
        lng: userLocation.value.lng,
        lat: userLocation.value.lat,
        distance: 50 // 搜索半径50公里
      }
    })
    
    console.log('附近店铺API响应status:', response.status)
    console.log('附近店铺API响应data:', response.data)
    console.log('响应数据类型:', typeof response.data)
    console.log('是否为数组:', Array.isArray(response.data))
    console.log('数组长度:', response.data ? response.data.length : '数据为空')
    
    if (response.data && Array.isArray(response.data)) {
      // 转换响应数据格式
      nearbyStores.value = response.data.map((store: any) => {
        console.log('处理店铺数据:', store)
        return {
          id: store.storeId, // 后端字段是storeId
          name: store.name,
          address: store.addressText, // 后端字段是addressText  
          distance: parseFloat((store.distance || 0).toFixed(1)),
          businessHours: store.businessHours || '09:00-21:00',
          imageUrl: store.logoUrl || '@/assets/homelogo.png', // 后端字段是logoUrl
          longitude: store.longitude,
          latitude: store.latitude
        }
      })
      
      console.log('转换后的店铺数据:', nearbyStores.value)
      
      if (nearbyStores.value.length === 0) {
        console.log('API返回空数据，使用默认数据')
        useDefaultStores()
      }
    } else {
      console.log('API响应格式不正确，使用默认数据')
      useDefaultStores()
    }
  } catch (error) {
    console.error('获取附近店铺失败:', error)
    useDefaultStores()
  }
}



// 使用默认店铺数据
const useDefaultStores = () => {
  // 不再使用硬编码的默认数据，只显示空状态
  console.log('没有找到附近店铺，显示空状态')
  nearbyStores.value = []
}

// 获取热门宠物和促销商品
const fetchFeaturedProducts = async () => {
  try {
    // 随机获取商品 - 不按类型筛选，直接获取随机商品
    const productsResponse = await axios.get('/api/user/products', {
      params: { 
        current: 1,
        size: 6  // 获取6个商品，用于两行三列展示
      }
    })
    
    if (productsResponse.data && productsResponse.data.records) {
      // 随机排序商品并映射为前端需要的格式
      const products = productsResponse.data.records
        .sort(() => Math.random() - 0.5)  // 随机排序
        .map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description || '优质商品',
          price: product.price,
          imageUrl: product.mainImageUrl || '@/assets/homelogo.png'
        }));
      
      hotPets.value = products;
    } else {
      // API调用失败时设置为空数组
      hotPets.value = [];
    }
    
    // 促销商品 API - 获取有折扣的商品
    const promotionsResponse = await axios.get('/api/user/products', {
      params: { 
        current: 1,
        size: 6
      }
    })
    
    if (promotionsResponse.data && promotionsResponse.data.records) {
      // 筛选出有折扣的商品（discount < 1.0）
      const discountedProducts = promotionsResponse.data.records
        .filter((product: any) => product.discount && product.discount < 1.0)
        .map((promo: any) => ({
          id: promo.id,
          name: promo.name,
          description: promo.description || '限时优惠',
          currentPrice: Number((promo.price * promo.discount).toFixed(2)), // 计算折扣后价格
          originalPrice: promo.price,
          imageUrl: promo.mainImageUrl || '@/assets/homelogo.png',
          discount: promo.discount
        }));
      
      promotions.value = discountedProducts;
    } else {
      // 如果API调用失败，设置为空数组
      promotions.value = [];
    }
  } catch (error) {
    console.error('获取商品数据失败:', error)
    // 错误时设置为空数组
    hotPets.value = [];
    promotions.value = [];
  }
}

onMounted(() => {
  // 获取用户位置
  getUserLocation()
  
  // 获取商品数据
  fetchFeaturedProducts()
  
  // 获取分类数据
  fetchCategories()
  
  // 加载高德地图API
  if (!window.AMap) {
    const script = document.createElement('script')
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=66d6616317a208714cc4133d3d09cf57'
    script.async = true
    document.head.appendChild(script)
  }
  

    })
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  min-width: 150px;
}

.search-box {
  flex-grow: 1;
  display: flex;
  max-width: 600px;
  margin: 0 20px;
}

.search-box input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 14px;
  outline: none;
}

.search-btn {
  padding: 10px 20px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.user-actions {
  display: flex;
  gap: 20px;
}

.user-icon, .cart-icon, .ai-icon {
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.user-icon:hover, .cart-icon:hover, .ai-icon:hover {
  color: #409eff;
}

.user-menu {
  position: relative;
}

.user-menu .user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 宠物分类 */
.pet-categories {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background-color: white;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 10px;
  cursor: pointer;
  transition: transform 0.2s;
}

.category-item:hover {
  transform: translateY(-5px);
}

.category-icon {
  width: 60px;
  height: 60px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.category-icon img {
  width: 35px;
  height: 35px;
}

.category-name {
  font-size: 14px;
}

/* 主要内容区 */
.main-content {
  flex: 1;
  padding: 0 15px;
}

.content-section {
  margin-bottom: 30px;
}

/* 章节标题 */
.section-title {
  padding: 15px 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 20px;
}

.title-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8f9fa;
  padding: 8px 15px;
  border-radius: 20px;
  border: 1px solid #e9ecef;
}

.location-icon {
  color: #409eff;
  font-size: 16px;
}

.location-text {
  font-size: 14px;
  color: #666;
  font-weight: normal;
}

.location-selector-btn {
  border-radius: 15px;
  padding: 8px 15px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.location-selector-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 热门宠物 */
.hot-pets {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.pet-card {
  flex: 1;
  min-width: 250px;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
  background-color: white;
}

.pet-card:hover {
  transform: translateY(-5px);
}

.pet-image {
  height: 200px;
  overflow: hidden;
}

.pet-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pet-info {
  padding: 15px;
}

.pet-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
}

.pet-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.pet-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 15px;
}

.detail-btn {
  width: 100%;
  padding: 8px 0;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.detail-btn:hover {
  background-color: #66b1ff;
}

/* 促销区域 */
.promotions {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.promotion-card {
  display: flex;
  width: 100%;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.promotion-card:hover {
  transform: translateY(-5px);
}

.promotion-image {
  width: 120px;
  height: 120px;
  min-width: 120px;
  overflow: hidden;
  position: relative;
}

.promotion-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #ff4d4f;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.promotion-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.promotion-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
}

.promotion-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.promotion-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 18px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* 附近店铺 */
.nearby-stores {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
}

.store-card {
  display: flex;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.store-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.store-image {
  width: 140px;
  height: 140px;
  min-width: 140px;
  overflow: hidden;
  position: relative;
}

.store-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.store-card:hover .store-image img {
  transform: scale(1.1);
}

.store-info {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.store-name {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 12px;
  color: #2c3e50;
  line-height: 1.3;
}

.store-address {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.store-address::before {
  content: "📍";
  font-size: 12px;
}

.store-distance {
  font-size: 13px;
  color: #27ae60;
  font-weight: 500;
  margin-bottom: 6px;
}

.store-hours {
  font-size: 13px;
  color: #95a5a6;
  margin-bottom: 15px;
}

.store-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.map-btn, .detail-btn {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
}

.map-btn {
  background: linear-gradient(135deg, #67c23a, #85ce61);
  color: white;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.map-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(103, 194, 58, 0.4);
}

.detail-btn {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.detail-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(145deg, #f8f9fa, #ffffff);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  border: 2px dashed #e9ecef;
  margin: 20px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 底部导航 - 只在移动端显示 */
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.nav-item.active {
  color: #409eff;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 3px;
}

.nav-item a {
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .home-container {
    padding-bottom: 60px;
  }
  
  .header {
    padding: 10px;
  }
  
  .title {
    font-size: 18px;
    min-width: auto;
  }
  
  .search-box {
    margin: 0 10px;
  }
  
  .user-actions {
    gap: 10px;
  }
  
  /* 位置信息响应式 */
  .title-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .location-info {
    width: 100%;
    justify-content: space-between;
  }
  
  /* 附近店铺响应式 */
  .nearby-stores {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .store-card {
    flex-direction: column;
  }
  
  .store-image {
    width: 100%;
    height: 200px;
    min-width: auto;
  }
  
  .store-info {
    padding: 15px;
  }
  
  .hot-pets {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 10px;
  }
  
  .pet-card {
    min-width: 200px;
    flex: 0 0 auto;
  }
  
  .pet-image {
    height: 150px;
  }
  
  .promotion-card {
    flex-direction: column;
  }
  
  .promotion-image {
    width: 100%;
    height: 180px;
    min-width: auto;
  }
  
  .bottom-nav {
    display: flex;
    justify-content: space-around;
  }
  
  /* 空状态响应式 */
  .empty-state {
    padding: 40px 15px;
    margin: 15px 0;
  }
  
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .empty-actions .el-button {
    width: 200px;
  }
}

/* 地图容器样式 */
.map-container {
  width: 100%;
  height: 400px;
  border-radius: 4px;
}

/* 位置选择器样式 */
.location-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.location-item {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.location-item:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
  transform: translateY(-2px);
}

.location-name {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.location-coords {
  font-size: 12px;
  color: #999;
}

@media (max-width: 768px) {
  .location-grid {
    grid-template-columns: 1fr;
  }
}
</style>