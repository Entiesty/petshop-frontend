<template>
  <div class="store-management">
    <div class="page-header">
      <h2>商店商品管理</h2>
      <button @click="showAddStoreModal = true" class="add-btn">
        + 添加商店
      </button>
    </div>

    <!-- 商店列表 -->
    <div class="store-list">
      <div v-for="store in stores" :key="store.id" class="store-card">
        <div class="store-header">
          <div class="store-info">
            <img v-if="store.logoUrl" :src="store.logoUrl" :alt="store.name" class="store-logo">
            <div class="store-details">
              <h3>{{ store.name }}</h3>
              <p class="store-address">{{ store.addressText }}</p>
              <p class="store-contact">联系电话: {{ store.contactPhone }}</p>
              <p v-if="store.longitude && store.latitude" class="store-location">
                位置: {{ store.longitude }}, {{ store.latitude }}
              </p>
            </div>
          </div>
          <div class="store-actions">
            <button @click="editStore(store)" class="edit-btn">编辑</button>
            <button @click="deleteStore(store.id)" class="delete-btn">删除</button>
          </div>
        </div>

        <!-- 商品列表 -->
        <div class="products-section">
          <div class="products-header">
            <h4>商品列表</h4>
           <button @click="openAddProductModal(store.id)" class="add-product-btn">
              + 添加商品
            </button>
          </div>

          <div class="products-grid">
            <div v-for="product in getStoreProducts(store.id)" :key="product.id" class="product-card">
              <img v-if="product.mainImageUrl" :src="product.mainImageUrl" :alt="product.name" class="product-image">
              <div class="product-info">
                <h5>{{ product.name }}</h5>
                <p class="product-price">¥{{ product.price }}</p>
                <p class="product-stock">库存: {{ product.stock }}</p>
                <div v-if="product.breed" class="product-details">
                  <span>品种: {{ product.breed }}</span>
                  <span>年龄: {{ product.age }}</span>
                  <span>性别: {{ product.sex }}</span>
                </div>
                <div class="product-actions">
                  <button @click="editProduct(product)" class="edit-btn">编辑</button>
                  <button @click="deleteProduct(product.id)" class="delete-btn">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑商店模态框 -->
    <div v-if="showAddStoreModal || showEditStoreModal" class="modal-overlay" @click="closeStoreModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingStore ? '编辑商店' : '添加商店' }}</h3>
          <button @click="closeStoreModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="saveStore" class="modal-form">
          <div class="form-group">
            <label>商店名称 *</label>
            <input v-model="storeForm.name" type="text" required>
          </div>
          <div class="form-group">
            <label>详细地址 *</label>
            <textarea v-model="storeForm.addressText" required></textarea>
          </div>
          <div class="form-group">
            <label>经度 *</label>
            <div class="input-with-button">
              <input v-model.number="storeForm.longitude" type="number" step="any" required>
              <button type="button" @click="getCurrentLocation" class="location-btn">获取位置</button>
            </div>
          </div>
          <div class="form-group">
            <label>纬度 *</label>
            <input v-model.number="storeForm.latitude" type="number" step="any" required>
          </div>
          <!-- 注释掉搜索附近商店功能
          <div class="form-group">
            <button type="button" @click="searchNearbyStores" class="search-nearby-btn">搜索附近商店</button>
          </div>
          -->
          <div class="form-group">
            <label>商店Logo</label>
            <div class="file-upload-group">
              <input 
                ref="logoFileInput" 
                type="file" 
                accept="image/*" 
                @change="handleLogoUpload" 
                style="display: none;"
              >
              <div class="upload-area" @click="triggerLogoUpload">
                <div v-if="storeForm.logoUrl" class="preview-container">
                  <img :src="storeForm.logoUrl" alt="Logo预览" class="logo-preview">
                  <div class="upload-overlay">
                    <span>点击更换图片</span>
                  </div>
                </div>
                <div v-else class="upload-placeholder">
                  <span>点击上传Logo图片</span>
                </div>
              </div>
              <button 
                v-if="storeForm.logoUrl" 
                type="button" 
                @click="clearLogo" 
                class="clear-btn"
              >
                清除图片
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>联系电话</label>
            <input v-model="storeForm.contactPhone" type="tel">
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeStoreModal" class="cancel-btn">取消</button>
            <button type="submit" class="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加/编辑商品模态框 -->
    <div v-if="showAddProductModal || showEditProductModal" class="modal-overlay" @click="closeProductModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingProduct ? '编辑商品' : '添加商品' }}</h3>
          <button @click="closeProductModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="saveProduct" class="modal-form">
          <div class="form-group">
            <label>商品名称 *</label>
            <input v-model="productForm.name" type="text" required>
          </div>
          <div class="form-group">
            <label>商品分类 *</label>
            <select v-model="productForm.categoryId" required>
              <option value="1">宠物类</option>
              <option value="2">宠物周边</option>
            </select>
          </div>
          <div class="form-group">
            <label>价格 *</label>
            <input v-model.number="productForm.price" type="number" step="0.01" required>
          </div>
          <div class="form-group">
            <label>折扣</label>
            <input 
              v-model.number="productForm.discount" 
              type="number" 
              step="0.01" 
              min="0.1" 
              max="1.0" 
              placeholder="0.8表示八折，1.0表示无折扣"
            >
            <small class="form-hint">范围：0.1-1.0，1.0表示无折扣，0.8表示八折</small>
          </div>
          <div class="form-group">
            <label>库存 *</label>
            <input v-model.number="productForm.stock" type="number" required>
          </div>
          <div class="form-group">
            <label>商品主图</label>
            <div class="file-upload-group">
              <input 
                ref="productImageFileInput" 
                type="file" 
                accept="image/*" 
                @change="handleProductImageUpload" 
                style="display: none;"
              >
              <div class="upload-area" @click="triggerProductImageUpload">
                <div v-if="productForm.mainImageUrl" class="preview-container">
                  <img :src="productForm.mainImageUrl" alt="商品图片预览" class="image-preview">
                  <div class="upload-overlay">
                    <span>点击更换图片</span>
                  </div>
                </div>
                <div v-else class="upload-placeholder">
                  <span>点击上传商品主图</span>
                </div>
              </div>
              <button 
                v-if="productForm.mainImageUrl" 
                type="button" 
                @click="clearProductImage" 
                class="clear-btn"
              >
                清除图片
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>介绍视频</label>
            <div class="file-upload-group">
              <input 
                ref="productVideoFileInput" 
                type="file" 
                accept="video/*" 
                @change="handleProductVideoUpload" 
                style="display: none;"
              >
              <div class="upload-area" @click="triggerProductVideoUpload">
                <div v-if="productForm.videoUrl" class="preview-container">
                  <video :src="productForm.videoUrl" class="video-preview" controls></video>
                  <div class="upload-overlay">
                    <span>点击更换视频</span>
                  </div>
                </div>
                <div v-else class="upload-placeholder">
                  <span>点击上传介绍视频</span>
                </div>
              </div>
              <button 
                v-if="productForm.videoUrl" 
                type="button" 
                @click="clearProductVideo" 
                class="clear-btn"
              >
                清除视频
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>商品描述</label>
            <textarea v-model="productForm.description"></textarea>
          </div>

          <!-- 宠物类特有字段 -->
          <div v-if="productForm.categoryId == 1" class="pet-fields">
            <div class="form-group">
              <label>品种</label>
              <input v-model="productForm.breed" type="text">
            </div>
            <div class="form-group">
              <label>年龄</label>
              <input v-model="productForm.age" type="text">
            </div>
            <div class="form-group">
              <label>性别</label>
              <select v-model="productForm.sex">
                <option value="">请选择</option>
                <option value="公">公</option>
                <option value="母">母</option>
              </select>
            </div>
            <div class="form-group">
              <label>体重(kg)</label>
              <input v-model.number="productForm.weight" type="number" step="0.1">
            </div>
            <div class="form-group">
              <label>颜色</label>
              <input v-model="productForm.color" type="text">
            </div>
            <div class="form-group">
              <label>健康信息</label>
              <textarea v-model="productForm.healthInfo"></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeProductModal" class="cancel-btn">取消</button>
            <button type="submit" class="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ADMIN_API, STORE_API } from '../../api/config'

interface Store {
  id: number
  name: string
  addressText: string
  logoUrl?: string
  contactPhone?: string
  longitude?: number  // 添加经度字段
  latitude?: number   // 添加纬度字段
  createdAt: string
  updatedAt: string
}

interface Product {
  id: number
  storeId: number
  categoryId: number
  name: string
  breed?: string
  age?: string
  sex?: string
  weight?: number
  color?: string
  description?: string
  healthInfo?: string
  price: number
  discount?: number  // 添加折扣字段
  stock: number
  mainImageUrl?: string
  videoUrl?: string
  averageRating?: number
  reviewCount?: number
  createdAt: string
  updatedAt: string
}

const stores = ref<Store[]>([])
const products = ref<Product[]>([])

// 商店相关状态
const showAddStoreModal = ref(false)
const showEditStoreModal = ref(false)
const editingStore = ref<Store | null>(null)
const storeForm = reactive({
  name: '',
  addressText: '',
  longitude: 0,
  latitude: 0,
  logoUrl: '',
  contactPhone: ''
})

// 商品相关状态
const showAddProductModal = ref(false)
const showEditProductModal = ref(false)
const editingProduct = ref<Product | null>(null)
const currentStoreId = ref<number | null>(null)
const productForm = reactive({
  storeId: 0,
  categoryId: 1,
  name: '',
  breed: '',
  age: '',
  sex: '',
  weight: 0,
  color: '',
  description: '',
  healthInfo: '',
  price: 0,
  discount: 1.0,  // 添加折扣字段，默认为1.0（无折扣）
  stock: 0,
  mainImageUrl: '',
  videoUrl: ''
})

// 获取商店列表
const fetchStores = async () => {
  try {
    const response = await fetch(ADMIN_API.STORES.LIST, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    console.log('商店数据:', data) // 添加日志查看返回的数据结构
    stores.value = data.records || []
  } catch (error) {
    console.error('获取商店列表失败:', error)
  }
}

// 获取商品列表
const fetchProducts = async () => {
  try {
    const response = await fetch(ADMIN_API.PRODUCTS.LIST, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    const data = await response.json()
    products.value = data.records || []
  } catch (error) {
    console.error('获取商品列表失败:', error)
  }
}

// 获取指定商店的商品
const getStoreProducts = (storeId: number) => {
  return products.value.filter(product => product.storeId === storeId)
}

// 商店操作
const editStore = async (store: Store) => {
  editingStore.value = store
  console.log('编辑商店数据:', store)
  
  try {
    // 调用详情接口获取完整的商店信息，包括经度纬度
    const response = await fetch(`${ADMIN_API.STORES.DETAIL}/${store.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('获取商店详情失败')
    }
    
    const storeDetail = await response.json()
    console.log('商店详情数据:', storeDetail)
    
    // 使用详情数据填充表单
    Object.assign(storeForm, {
      name: storeDetail.name,
      addressText: storeDetail.addressText,
      logoUrl: storeDetail.logoUrl || '',
      contactPhone: storeDetail.contactPhone || '',
      longitude: storeDetail.longitude || 0,
      latitude: storeDetail.latitude || 0
    })
    
    console.log('表单数据设置完成:', storeForm)
    showEditStoreModal.value = true
  } catch (error) {
    console.error('获取商店详情失败:', error)
    // 如果详情接口失败，使用列表数据作为后备
  Object.assign(storeForm, {
    name: store.name,
    addressText: store.addressText,
    logoUrl: store.logoUrl || '',
    contactPhone: store.contactPhone || '',
      longitude: store.longitude || 0,
      latitude: store.latitude || 0
  })
  showEditStoreModal.value = true
  }
}

const deleteStore = async (storeId: number) => {
  if (confirm('确定要删除这个商店吗？')) {
    try {
      await fetch(`${ADMIN_API.STORES.DELETE}/${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      await fetchStores()
      await fetchProducts()
    } catch (error) {
      console.error('删除商店失败:', error)
    }
  }
}

const saveStore = async () => {
  console.log('保存商店，表单数据:', storeForm) // 断点7：保存前检查表单数据
  try {
    const url = editingStore.value
      ? `${ADMIN_API.STORES.UPDATE}/${editingStore.value.id}`
      : ADMIN_API.STORES.CREATE
    const method = editingStore.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(storeForm)
    })
    
    console.log('API响应:', response) // 添加断点8：检查API响应
    
    closeStoreModal()
    await fetchStores()
  } catch (error) {
    console.error('保存商店失败:', error) // 添加断点9：记录API错误
  }
  console.log('保存完成') // 添加断点10：保存完成
}

const closeStoreModal = () => {
  showAddStoreModal.value = false
  showEditStoreModal.value = false
  editingStore.value = null
  Object.assign(storeForm, {
    name: '',
    addressText: '',
    longitude: 0,
    latitude: 0,
    logoUrl: '',
    contactPhone: ''
  })
}

// 商品操作
const openAddProductModal = (storeId: number) => {
  currentStoreId.value = storeId
  productForm.storeId = storeId
  showAddProductModal.value = true
}

const editProduct = (product: Product) => {
  editingProduct.value = product
  Object.assign(productForm, product)
  showEditProductModal.value = true
}

const deleteProduct = async (productId: number) => {
  if (confirm('确定要删除这个商品吗？')) {
    try {
      await fetch(`${ADMIN_API.PRODUCTS.DELETE}/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      await fetchProducts()
    } catch (error) {
      console.error('删除商品失败:', error)
    }
  }
}

const saveProduct = async () => {
  try {
    const url = editingProduct.value
      ? `${ADMIN_API.PRODUCTS.UPDATE}/${editingProduct.value.id}`
      : ADMIN_API.PRODUCTS.CREATE
    const method = editingProduct.value ? 'PUT' : 'POST'

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(productForm)
    })

    closeProductModal()
    await fetchProducts()
  } catch (error) {
    console.error('保存商品失败:', error)
  }
}

const closeProductModal = () => {
  showAddProductModal.value = false
  showEditProductModal.value = false
  editingProduct.value = null
  currentStoreId.value = null
  Object.assign(productForm, {
    storeId: 0,
    categoryId: 1,
    name: '',
    breed: '',
    age: '',
    sex: '',
    weight: 0,
    color: '',
    description: '',
    healthInfo: '',
    price: 0,
    discount: 1.0,  // 重置折扣为1.0
    stock: 0,
    mainImageUrl: '',
    videoUrl: ''
  })
}

onMounted(() => {
  fetchStores()
  fetchProducts()
})

// 获取当前位置
const getCurrentLocation = () => {
  console.log('开始获取位置...') // 断点1：开始获取位置
  if (!navigator.geolocation) {
    alert('您的浏览器不支持地理位置功能')
    return
  }

  // 添加等待提示
  const locationBtn = document.querySelector('.location-btn') as HTMLButtonElement
  const originalButtonText = locationBtn?.textContent || '获取位置'
  
  if (locationBtn) {
    locationBtn.textContent = '获取中...'
    locationBtn.disabled = true
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('位置获取成功:', position) // 断点2：位置获取成功
      storeForm.longitude = position.coords.longitude
      storeForm.latitude = position.coords.latitude
      console.log('更新表单经纬度:', storeForm.longitude, storeForm.latitude) // 断点3：更新表单数据
      
      // 恢复按钮状态
      if (locationBtn) {
        locationBtn.textContent = originalButtonText
        locationBtn.disabled = false
      }
      
      // 添加成功提示
      alert(`位置获取成功！\n经度: ${storeForm.longitude.toFixed(6)}\n纬度: ${storeForm.latitude.toFixed(6)}`)
    },
    (error) => {
      console.error('获取位置失败:', error) // 断点4：位置获取失败
      let errorMsg = ''
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = '用户拒绝了位置请求，请确保您的浏览器已授权位置权限'
          break
        case error.POSITION_UNAVAILABLE:
          errorMsg = '位置信息不可用，请检查您的网络连接或GPS服务是否开启'
          break
        case error.TIMEOUT:
          errorMsg = '获取位置超时，请重试'
          break
        default:
          errorMsg = '未知错误'
      }
      alert(`获取位置失败: ${errorMsg}`)
      
      // 恢复按钮状态
      if (locationBtn) {
        locationBtn.textContent = originalButtonText
        locationBtn.disabled = false
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000, // 增加超时时间
      maximumAge: 0
    }
  )
}

// 添加附近商店查询功能
const searchNearbyStores = async () => {
  if (!storeForm.longitude || !storeForm.latitude) {
    alert('请先获取位置信息')
    return
  }
  
  try {
    const response = await fetch(`${STORE_API.NEARBY}?lng=${storeForm.longitude}&lat=${storeForm.latitude}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('获取附近商店失败')
    }
    
    const data = await response.json()
    console.log('附近商店数据:', data)
    
    if (data && data.length > 0) {
      // 显示附近商店信息
      const storesInfo = data.map((store: any, index: number) => 
        `${index + 1}. ${store.name} - 距离: ${store.distance.toFixed(2)}km`
      ).join('\n')
      
      alert(`附近商店:\n${storesInfo}`)
    } else {
      alert('附近没有找到商店')
    }
  } catch (error: any) {
    console.error('获取附近商店失败:', error)
    alert(`获取附近商店失败: ${error.message || '未知错误'}`)
  }
}

// 添加文件上传相关的ref
const logoFileInput = ref<HTMLInputElement>()
const productImageFileInput = ref<HTMLInputElement>()
const productVideoFileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const productUploading = ref(false)

// 添加文件上传相关函数
const triggerLogoUpload = () => {
  logoFileInput.value?.click()
}

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  
  // 验证文件大小（限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB')
    return
  }
  
  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/admin/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('上传失败')
    }
    
    const data = await response.json()
    storeForm.logoUrl = data.fileUrl
    
    alert('图片上传成功！')
  } catch (error: any) {
    console.error('上传失败:', error)
    alert(`上传失败: ${error.message || '未知错误'}`)
  } finally {
    uploading.value = false
    // 清空input的值，允许重复选择同一文件
    if (target) target.value = ''
  }
}

const clearLogo = () => {
  storeForm.logoUrl = ''
}

// 商品图片上传相关函数
const triggerProductImageUpload = () => {
  productImageFileInput.value?.click()
}

const handleProductImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }
  
  // 验证文件大小（限制为10MB）
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过10MB')
    return
  }
  
  productUploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/admin/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('上传失败')
    }
    
    const data = await response.json()
    productForm.mainImageUrl = data.fileUrl
    
    alert('商品图片上传成功！')
  } catch (error: any) {
    console.error('上传失败:', error)
    alert(`上传失败: ${error.message || '未知错误'}`)
  } finally {
    productUploading.value = false
    // 清空input的值，允许重复选择同一文件
    if (target) target.value = ''
  }
}

const clearProductImage = () => {
  productForm.mainImageUrl = ''
}

// 商品视频上传相关函数
const triggerProductVideoUpload = () => {
  productVideoFileInput.value?.click()
}

const handleProductVideoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('video/')) {
    alert('请选择视频文件')
    return
  }
  
  // 验证文件大小（限制为50MB）
  if (file.size > 50 * 1024 * 1024) {
    alert('视频大小不能超过50MB')
    return
  }
  
  productUploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/admin/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('上传失败')
    }
    
    const data = await response.json()
    productForm.videoUrl = data.fileUrl
    
    alert('介绍视频上传成功！')
  } catch (error: any) {
    console.error('上传失败:', error)
    alert(`上传失败: ${error.message || '未知错误'}`)
  } finally {
    productUploading.value = false
    // 清空input的值，允许重复选择同一文件
    if (target) target.value = ''
  }
}

const clearProductVideo = () => {
  productForm.videoUrl = ''
}
</script>

<style scoped>
.store-management {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.add-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-btn:hover {
  background: #40a9ff;
}

.store-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.store-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.store-info {
  display: flex;
  gap: 16px;
}

.store-logo {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.store-details h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.store-address, .store-contact {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.store-actions {
  display: flex;
  gap: 8px;
}

.edit-btn {
  padding: 6px 12px;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn {
  padding: 6px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.products-section {
  margin-top: 20px;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.products-header h4 {
  margin: 0;
  color: #333;
  font-size: 16px;
}

.add-product-btn {
  padding: 6px 12px;
  background: #722ed1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.product-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.product-info {
  padding: 12px;
}

.product-info h5 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 14px;
}

.product-price {
  color: #ff4d4f;
  font-weight: bold;
  font-size: 16px;
  margin: 4px 0;
}

.product-stock {
  color: #666;
  font-size: 12px;
  margin: 4px 0;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 8px 0;
}

.product-details span {
  font-size: 12px;
  color: #666;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.pet-fields {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
  margin-top: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background: #40a9ff;
}

/* 添加位置按钮样式 */
.input-with-button {
  display: flex;
  gap: 8px;
}

.location-btn {
  padding: 8px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.location-btn:hover {
  background: #40a9ff;
}

.search-nearby-btn {
  padding: 8px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.search-nearby-btn:hover {
  background: #40a9ff;
}

/* 文件上传样式 */
.file-upload-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  position: relative;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #1890ff;
}

.upload-placeholder {
  color: #666;
  font-size: 14px;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.logo-preview {
  max-width: 100%;
  max-height: 100px;
  object-fit: contain;
  border-radius: 4px;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 4px;
}

.preview-container:hover .upload-overlay {
  opacity: 1;
}

.clear-btn {
  padding: 6px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  align-self: flex-start;
}

.clear-btn:hover {
  background: #ff7875;
}

.image-preview {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 4px;
  object-fit: cover;
}

.video-preview {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 4px;
  object-fit: cover;
}
</style>
