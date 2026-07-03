<template>
  <div class="toggle-wrapper">
    <!-- 使用 :checked 绑定状态，并通过 @click 触发事件 -->
    <input class="toggle-checkbox" type="checkbox" :checked="modelValue" @click="handleToggle" />
    <div class="toggle-container">
      <div class="toggle-button">
        <div class="toggle-button-circles-container">
          <div v-for="n in 12" :key="n" class="toggle-button-circle"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

// 接收父组件的 modelValue 作为初始状态，并且定义更新事件
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

// 处理切换按钮的状态变化
const handleToggle = (event) => {
  const newCheckedState = event.target.checked
  // 触发更新事件，通知父组件
  emit('update:modelValue', newCheckedState)
  console.log(newCheckedState ? 'Switch ON' : 'Switch OFF')
}
</script>

<style scoped>
.toggle-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.125em;
  font-size: 1.5em;
  background-image: linear-gradient(to bottom, #d5d5d5, #e8e8e8);
  border-radius: 0.5em;
  box-shadow: 0 1px 1px rgb(255 255 255 / 0.6);
}

.toggle-checkbox {
  position: absolute;
  z-index: 2; /* 修改 z-index 使其在最上面 */
  width: 100%;
  height: 100%;
  font: inherit;
  appearance: none;
  cursor: pointer;
  border-radius: inherit;
  opacity: 0.7; /* 让 input 稍微可见，保证能触发点击事件 */
}

.toggle-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 3em;
  height: 1.5em;
  background-color: #e8e8e8;
  border-radius: 0.375em;
  box-shadow:
    inset 0 0 0.0625em 0.125em rgb(255 255 255 / 0.2),
    inset 0 0.0625em 0.125em rgb(0 0 0 / 0.4);
  transition: background-color 0.4s linear;
}

.toggle-checkbox:checked + .toggle-container {
  background-color: #f3b519;
}

.toggle-button {
  position: absolute;
  left: 0.0625em;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.375em;
  height: 1.375em;
  background-color: #e8e8e8;
  border-radius: 0.3125em;
  box-shadow:
    inset 0 -0.0625em 0.0625em 0.125em rgb(0 0 0 / 0.1),
    inset 0 -0.125em 0.0625em rgb(0 0 0 / 0.2),
    inset 0 0.1875em 0.0625em rgb(255 255 255 / 0.3),
    0 0.125em 0.125em rgb(0 0 0 / 0.5);
  transition: left 0.4s;
}

.toggle-checkbox:checked + .toggle-container > .toggle-button {
  left: 1.5625em;
}

.toggle-button-circles-container {
  position: absolute;
  display: grid;
  grid-template-columns: repeat(3, min-content);
  gap: 0.125em;
  margin: 0 auto;
}

.toggle-button-circle {
  width: 0.125em;
  height: 0.125em;
  background-image: radial-gradient(circle at 50% 0, #f5f5f5, #c4c4c4);
  border-radius: 50%;
}
</style>
