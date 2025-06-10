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
        <router-link to="/user" class="user-icon">
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
      <div class="content-section">
        <div class="section-title">限时促销</div>
        <div class="promotions">
          <div class="promotion-card" v-for="promotion in promotions" :key="promotion.id" @click="viewProductDetail(promotion.id)">
            <div class="promotion-image">
              <img :src="promotion.imageUrl" :alt="promotion.name">
            </div>
            <div class="promotion-info">
              <div class="promotion-name">{{ promotion.name }}</div>
              <div class="promotion-desc">{{ promotion.description }}</div>
              <div class="promotion-price">
                <span class="current-price">¥{{ promotion.currentPrice }}</span>
                <span class="original-price">¥{{ promotion.originalPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 附近店铺 -->
      <div class="content-section">
        <div class="section-title">附近店铺</div>
        <div class="nearby-stores">
          <div class="store-card" v-for="store in nearbyStores" :key="store.id">
            <div class="store-image">
              <img :src="store.imageUrl || '/assets/store-default.jpg'" :alt="store.name">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { User, ShoppingCart, HomeFilled } from '@element-plus/icons-vue'

// 扩展Window接口以包含AMap
declare global {
  interface Window {
    AMap: any;
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

const router = useRouter()
const searchKeyword = ref('')
const mapDialogVisible = ref(false)
const mapContainer = ref(null)
const selectedStore = ref<StoreData | null>(null)
const userLocation = ref({ lng: 116.404, lat: 39.915 }) // 默认位置（北京）

// 宠物分类
const petCategories = ref([
  { id: 1, name: '猫咪', iconUrl: '/assets/icons/cat.png' },
  { id: 2, name: '狗狗', iconUrl: '/assets/icons/dog.png' },
  { id: 3, name: '兔子', iconUrl: '/assets/icons/rabbit.png' },
  { id: 4, name: '鸟类', iconUrl: '/assets/icons/bird.png' },
  { id: 5, name: '水族', iconUrl: '/assets/icons/fish.png' },
  { id: 6, name: '仓鼠', iconUrl: '/assets/icons/hamster.png' },
  { id: 7, name: '爬虫', iconUrl: '/assets/icons/reptile.png' }
])

// 热门宠物
const hotPets = ref([
  { 
    id: 1, 
    name: '布偶猫', 
    description: '温顺亲人，适合家庭饲养', 
    price: 3800, 
    imageUrl: '/assets/pets/cat.jpg'
  },
  { 
    id: 2, 
    name: '金毛犬', 
    description: '聪明友善，适合陪伴儿童', 
    price: 2500, 
    imageUrl: '/assets/pets/dog.jpg'
  },
  { 
    id: 3, 
    name: '垂耳兔', 
    description: '性格温顺，毛色纯正', 
    price: 680, 
    imageUrl: '/assets/pets/rabbit.jpg'
  }
])

// 促销商品
const promotions = ref([
  {
    id: 101,
    name: '宠物食品特惠',
    description: '进口高品质猫粮',
    currentPrice: 128,
    originalPrice: 168,
    imageUrl: '/assets/products/petfood.jpg'
  },
  {
    id: 102,
    name: '宠物用品套装',
    description: '全套宠物玩具5件套',
    currentPrice: 299,
    originalPrice: 399,
    imageUrl: '/assets/products/pettoys.jpg'
  },
  {
    id: 103,
    name: '宠物美容套装',
    description: '专业宠物梳+剪刀套',
    currentPrice: 159,
    originalPrice: 209,
    imageUrl: '/assets/products/petgrooming.jpg'
  }
])

// 附近店铺
const nearbyStores = ref([
  {
    id: 1,
    name: '爱宠之家旗舰店',
    address: '朝阳区建国路98号',
    distance: 1.2,
    businessHours: '09:00-21:00',
    imageUrl: '/assets/stores/store1.jpg',
    longitude: 116.4133,
    latitude: 39.9110
  },
  {
    id: 2,
    name: '萌宠乐园分店',
    address: '海淀区中关村大街115号',
    distance: 2.5,
    businessHours: '10:00-20:00',
    imageUrl: '/assets/stores/store2.jpg',
    longitude: 116.3380,
    latitude: 39.9860
  },
  {
    id: 3,
    name: '宠物天地',
    address: '西城区西单北大街131号',
    distance: 3.1,
    businessHours: '09:30-20:30',
    imageUrl: '/assets/stores/store3.jpg',
    longitude: 116.3770,
    latitude: 39.9088
  }
])

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
  router.push({
    path: '/category',
    query: { id: categoryId }
  })
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
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lng: position.coords.longitude,
          lat: position.coords.latitude
        }
        fetchNearbyStores()
      },
      (error) => {
        console.error('获取位置失败:', error)
        fetchNearbyStores() // 使用默认位置获取店铺
      }
    )
  } else {
    console.error('浏览器不支持地理位置服务')
    fetchNearbyStores() // 使用默认位置获取店铺
  }
}

// 从API获取附近店铺
const fetchNearbyStores = async () => {
  try {
    const response = await axios.get('/api/user/stores/nearby', {
      params: {
        lng: userLocation.value.lng,
        lat: userLocation.value.lat,
        distance: 10 // 10公里范围内
      }
    })
    
    if (response.data && response.data.length > 0) {
      // 转换响应数据格式
      nearbyStores.value = response.data.map((store: any) => ({
        id: store.id,
        name: store.name,
        address: store.address,
        distance: store.distance.toFixed(1),
        businessHours: store.businessHours || '09:00-21:00',
        imageUrl: store.imageUrl || '/assets/stores/store-default.jpg',
        longitude: store.longitude,
        latitude: store.latitude
      }))
    }
  } catch (error) {
    console.error('获取附近店铺失败:', error)
    // 保留模拟数据作为后备
  }
}

// 获取热门宠物和促销商品
const fetchFeaturedProducts = async () => {
  try {
    // 热门宠物 API
    const hotPetsResponse = await axios.get('/api/user/products/featured', {
      params: { type: 'pet', limit: 3 }
    })
    
    if (hotPetsResponse.data && hotPetsResponse.data.length > 0) {
      hotPets.value = hotPetsResponse.data.map((pet: any) => ({
        id: pet.id,
        name: pet.name,
        description: pet.description,
        price: pet.price,
        imageUrl: pet.imageUrl || '/assets/pets/pet-default.jpg'
      }))
    }
    
    // 促销商品 API
    const promotionsResponse = await axios.get('/api/user/products/promotion')
    
    if (promotionsResponse.data && promotionsResponse.data.length > 0) {
      promotions.value = promotionsResponse.data.map((promo: any) => ({
        id: promo.id,
        name: promo.name,
        description: promo.description,
        currentPrice: promo.promotionPrice,
        originalPrice: promo.originalPrice,
        imageUrl: promo.imageUrl || '/assets/products/product-default.jpg'
      }))
    }
  } catch (error) {
    console.error('获取商品数据失败:', error)
    // 保留模拟数据作为后备
  }
}

onMounted(() => {
  // 获取用户位置
  getUserLocation()
  
  // 获取商品数据
  fetchFeaturedProducts()
  
  // 加载高德地图API
  if (!window.AMap) {
    const script = document.createElement('script')
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=您的高德地图Key'
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

.user-icon, .cart-icon {
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.user-icon:hover, .cart-icon:hover {
  color: #409eff;
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
  padding: 10px 0;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 15px;
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
}

.promotion-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.store-card {
  display: flex;
  width: 100%;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.store-image {
  width: 150px;
  height: 150px;
  min-width: 150px;
  overflow: hidden;
}

.store-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.store-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
}

.store-address, .store-distance, .store-hours {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.store-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.map-btn, .detail-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.map-btn {
  background-color: #67c23a;
  color: white;
}

.map-btn:hover {
  background-color: #85ce61;
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
  
  .store-card, .promotion-card {
    flex-direction: column;
  }
  
  .store-image, .promotion-image {
    width: 100%;
    height: 180px;
    min-width: auto;
  }
  
  .bottom-nav {
    display: flex;
    justify-content: space-around;
  }
}

/* 地图容器样式 */
.map-container {
  width: 100%;
  height: 400px;
  border-radius: 4px;
}
</style> 