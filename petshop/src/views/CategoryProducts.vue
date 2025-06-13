<template>
  <div class="category-products">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <div class="category-title">
        <h2>{{ currentCategory?.name || '商品分类' }}</h2>
        <p v-if="currentCategory?.parentName">{{ currentCategory.parentName }} > {{ currentCategory.name }}</p>
      </div>
    </div>

    <!-- 子分类筛选 -->
    <div class="sub-categories" v-if="subCategories.length > 0">
      <div class="category-filters">
        <div 
          class="filter-item" 
          :class="{ active: selectedSubCategory === null }" 
          @click="filterBySubCategory(null)"
        >
          全部
        </div>
        <div 
          v-for="subCategory in subCategories" 
          :key="subCategory.id"
          class="filter-item" 
          :class="{ active: selectedSubCategory === subCategory.id }" 
          @click="filterBySubCategory(subCategory.id)"
        >
          {{ subCategory.name }}
        </div>
      </div>
    </div>

    <!-- 商品排序和筛选 -->
    <div class="product-controls">
      <div class="sort-controls">
        <span>排序：</span>
        <select v-model="sortBy" @change="sortProducts">
          <option value="default">默认</option>
          <option value="price_asc">价格从低到高</option>
          <option value="price_desc">价格从高到低</option>
          <option value="name">名称</option>
        </select>
      </div>
      <div class="view-controls">
        <button 
          :class="{ active: viewMode === 'grid' }" 
          @click="viewMode = 'grid'"
        >
          <el-icon><Grid /></el-icon>
        </button>
        <button 
          :class="{ active: viewMode === 'list' }" 
          @click="viewMode = 'list'"
        >
          <el-icon><List /></el-icon>
        </button>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="products-container">
      <div v-if="loading" class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      
      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>暂无商品</p>
      </div>
      
      <div v-else :class="['products-grid', viewMode]">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id" 
          class="product-card"
          @click="viewProductDetail(product.id)"
        >
          <div class="product-image">
            <img :src="product.mainImageUrl || '/src/assets/homelogo.png'" :alt="product.name">
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description" v-if="product.description">{{ product.description }}</p>
            <div class="product-details" v-if="product.breed">
              <span class="detail-item">品种：{{ product.breed }}</span>
              <span class="detail-item" v-if="product.age">年龄：{{ product.age }}</span>
              <span class="detail-item" v-if="product.sex">性别：{{ product.sex }}</span>
            </div>
            <div class="product-price">
              <span class="current-price">¥{{ product.price }}</span>
              <span class="stock-info">库存：{{ product.stock }}</span>
            </div>
            <button class="view-detail-btn" @click.stop="viewProductDetail(product.id)">
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalProducts"
        layout="prev, pager, next, jumper"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElPagination } from 'element-plus'
import { ArrowLeft, Grid, List, Loading } from '@element-plus/icons-vue'

interface Category {
  id: number
  name: string
  parentId?: number
  parentName?: string
  iconUrl?: string
  sortOrder?: number
}

interface Product {
  id: number
  storeId: number
  categoryId: number
  productType?: number // 1-活体宠物, 2-宠物用品
  name: string
  breed?: string
  age?: string
  sex?: string
  weight?: number
  color?: string
  description?: string
  healthInfo?: string
  price: number
  stock: number
  mainImageUrl?: string
  videoUrl?: string
  averageRating?: number
  reviewCount?: number
  createdAt: string
  updatedAt: string
}

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const currentCategory = ref<Category | null>(null)
const subCategories = ref<Category[]>([])
const products = ref<Product[]>([])
const selectedSubCategory = ref<number | null>(null)
const sortBy = ref('default')
const viewMode = ref('grid')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const totalProducts = ref(0)
const totalPages = computed(() => Math.ceil(totalProducts.value / pageSize.value))

// 所有子分类及其商品的缓存
const categoryProductsCache = ref<Map<number, Product[]>>(new Map())

// 筛选后的商品
const filteredProducts = computed(() => {
  let result = products.value

  // 按子分类筛选
  if (selectedSubCategory.value) {
    result = result.filter(product => product.categoryId === selectedSubCategory.value)
  }

  // 排序
  switch (sortBy.value) {
    case 'price_asc':
      result = [...result].sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      result = [...result].sort((a, b) => b.price - a.price)
      break
    case 'name':
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
      break
  }

  // 分页
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  totalProducts.value = result.length
  
  return result.slice(start, end)
})

// 获取分类信息
const fetchCategoryInfo = async (categoryId: number) => {
  try {
    const response = await axios.get(`/api/user/categories/${categoryId}`)
    currentCategory.value = response.data
  } catch (error) {
    console.error('获取分类信息失败:', error)
  }
}

// 获取子分类
const fetchSubCategories = async (parentId: number) => {
  try {
    const response = await axios.get(`/api/user/categories`, {
      params: { parentId }
    })
    subCategories.value = response.data || []
  } catch (error) {
    console.error('获取子分类失败:', error)
    subCategories.value = []
  }
}

// 获取当前分类下的所有商品（包括子分类商品）
const fetchAllCategoryProducts = async (categoryId: number) => {
  loading.value = true
  try {
    // 首先获取当前分类的直接商品
    const directProductsResponse = await axios.get('/api/user/products', {
      params: {
        categoryId: categoryId,
        current: 1,
        size: 1000
      }
    })
    
    let allProducts: Product[] = directProductsResponse.data?.records || []
    
    // 获取子分类
    await fetchSubCategories(categoryId)
    
    // 如果有子分类，获取每个子分类的商品
    if (subCategories.value.length > 0) {
      const subCategoryPromises = subCategories.value.map(async (subCategory) => {
        try {
          const subProductsResponse = await axios.get('/api/user/products', {
            params: {
              categoryId: subCategory.id,
              current: 1,
              size: 1000
            }
          })
          const subProducts = subProductsResponse.data?.records || []
          
          // 缓存子分类商品
          categoryProductsCache.value.set(subCategory.id, subProducts)
          
          return subProducts
        } catch (error) {
          console.error(`获取子分类 ${subCategory.name} 商品失败:`, error)
          return []
        }
      })
      
      const subCategoryProducts = await Promise.all(subCategoryPromises)
      
      // 合并所有子分类的商品
      subCategoryProducts.forEach(products => {
        allProducts = allProducts.concat(products)
      })
    }
    
    products.value = allProducts
    
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    products.value = []
  } finally {
    loading.value = false
  }
}

// 按子分类筛选
const filterBySubCategory = (subCategoryId: number | null) => {
  selectedSubCategory.value = subCategoryId
  currentPage.value = 1 // 重置页码
  
  if (subCategoryId === null) {
    // 显示所有商品
    return
  }
  
  // 如果选择了特定子分类，确保其商品已加载
  if (!categoryProductsCache.value.has(subCategoryId)) {
    // 如果缓存中没有该子分类的商品，重新加载
    const currentCategoryId = parseInt(route.params.id as string)
    fetchAllCategoryProducts(currentCategoryId)
  }
}

// 排序商品
const sortProducts = () => {
  currentPage.value = 1 // 重置页码
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 查看商品详情
const viewProductDetail = (productId: number) => {
  router.push(`/product/${productId}`)
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 监听路由参数变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    const categoryId = parseInt(newId as string)
    await fetchCategoryInfo(categoryId)
    await fetchAllCategoryProducts(categoryId)
  }
}, { immediate: true })

onMounted(async () => {
  const categoryId = parseInt(route.params.id as string)
  if (categoryId) {
    await fetchCategoryInfo(categoryId)
    await fetchAllCategoryProducts(categoryId)
  }
})
</script>

<style scoped>
.category-products {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 24px;
  background-color: #f5f5f5;
}

/* 商品控制 */
.product-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

/* 商品容器 */
.products-container {
  min-height: 400px;
  width: 100%;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 20px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: #e6f7ff;
  color: #1890ff;
}

.category-title h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.category-title p {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

/* 子分类筛选 */
.sub-categories {
  margin-bottom: 24px;
  max-width: 1800px;
  margin-left: auto;
  margin-right: auto;
}

.category-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.filter-item:hover {
  background: #e6f7ff;
  color: #1890ff;
}

.filter-item.active {
  background: #1890ff;
  color: white;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-controls select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.view-controls {
  display: flex;
  gap: 0; /* 移除按钮之间的间隙 */
}

.view-controls button {
  width: 40px;
  height: 40px;
  padding: 8px;
  border: 1px solid #d9d9d9;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-controls button:first-child {
  border-radius: 4px 0 0 4px;
  border-right: none; /* 确保按钮之间没有双边框 */
}

.view-controls button:last-child {
  border-radius: 0 4px 4px 0;
}

.view-controls button.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
  z-index: 1; /* 确保活动按钮的边框显示在上层 */
}

/* 商品容器 */
.products-container {
  min-height: 400px;
  width: 100%;
  max-width: 1800px;
  margin-left: auto;
  margin-right: auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 商品网格 */
.products-grid {
  display: grid;
  gap: 24px;
  width: 100%;
}

.products-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  max-width: 100%;
}

@media (min-width: 1200px) {
  .products-grid.grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.products-grid.list {
  grid-template-columns: 1fr;
}

/* 商品卡片 */
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.products-grid.list .product-card {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.product-image {
  height: 220px;
  overflow: hidden;
  position: relative;
}

.products-grid.list .product-image {
  width: 280px;
  height: 200px;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.products-grid.list .product-info {
  flex: 1;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.product-description {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-item {
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff4d4f;
}

.stock-info {
  font-size: 14px;
  color: #666;
}

.view-detail-btn {
  width: 100%;
  padding: 8px 0;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.view-detail-btn:hover {
  background: #40a9ff;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 40px;
  max-width: 1800px;
  margin-left: auto;
  margin-right: auto;
}

/* 响应式设计 */
@media (max-width: 1600px) and (min-width: 1201px) {
  .products-grid.grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) and (min-width: 769px) {
  .products-grid.grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .category-products {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .product-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .sort-controls {
    justify-content: space-between;
  }

  .products-grid.grid {
    grid-template-columns: 1fr;
  }

  .products-grid.list .product-card {
    flex-direction: column;
  }

  .products-grid.list .product-image {
    width: 100%;
    height: 200px;
  }

  .category-filters {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }

  .filter-item {
    white-space: nowrap;
  }
}
</style>