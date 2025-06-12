<template>
  <div class="version-toggle">
    <div class="toggle-container">
      <button 
        @click="toggleVersion" 
        class="toggle-btn"
        :class="{ 'macos-version': isRedesigned }"
      >
        <span class="toggle-icon">{{ isRedesigned ? '🍎' : '🎨' }}</span>
        <span class="toggle-text">
          {{ isRedesigned ? 'macOS版' : '切换到macOS版' }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getRedesignedPath, isRedesignedPage } from '../router/redesignedRoutes'

const router = useRouter()
const route = useRoute()

const isRedesigned = computed(() => isRedesignedPage(route.path))

const toggleVersion = () => {
  if (isRedesigned.value) {
    // 从重构版本切换回原版本
    const originalPath = route.path.replace('/redesigned', '') || '/'
    router.push(originalPath)
  } else {
    // 从原版本切换到重构版本
    const redesignedPath = getRedesignedPath(route.path)
    if (redesignedPath !== route.path) {
      router.push(redesignedPath)
    }
  }
}
</script>

<style scoped>
.version-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.toggle-container {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  
  &:hover {
    background: rgba(0, 122, 255, 0.1);
    color: #007AFF;
  }
  
  &.macos-version {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #5a67d8, #6b46c1);
    }
  }
}

.toggle-icon {
  font-size: 16px;
}

.toggle-text {
  white-space: nowrap;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .version-toggle {
    top: 10px;
    right: 10px;
  }
  
  .toggle-btn {
    padding: 10px 12px;
    font-size: 13px;
    
    .toggle-text {
      display: none;
    }
  }
}
</style> 