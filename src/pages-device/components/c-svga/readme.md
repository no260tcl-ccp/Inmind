# c-svga

### 
- c-svga svga动画

### c-design交流群号：330647926

### 示例预览

[https://cloud.vuedata.wang/cdesign/#/pages/svga/svga](https://cloud.vuedata.wang/cdesign/#/pages/svga/svga)
####
![微信小程序预览](https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/7dca3f02-baef-470d-88d2-eebd7c31ab73.jpg?x-oss-process=image/resize,m_fixed,w_240)

### 一、使用示例
#### vue2/vue3
```html
<template>
	<view class="page">
		<c-svga ref="cSvgaRef" :canvasId='canvasId'
		 :src="src" 
		 :loops='0' :auto-play="true" @frame='onFrame' @finished='onFinished' @percentage='onPercentage' @loaded='onLoaded'></c-svga>
		<view class="content">
			<view>切换图像</view>
			<view class="btnBox">
				<button @click="src='https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/b3875bda-8de0-476d-8f55-d10b24f16d98.svg'" size="mini">小汽车</button>
				<button @click="src='https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/eebed809-b03e-4b90-88f8-5d6811b65f86.svg'" size="mini">玫瑰花</button>
			</view>
			<view>播放暂停</view>
			<view class="btnBox">
				<button @click="$refs.cSvgaRef.call('startAnimation')" size="mini">播放</button>
				<button @click="$refs.cSvgaRef.call('startAnimation',true)" size="mini">反向播放</button>
				<button @click="$refs.cSvgaRef.call('pauseAnimation')" size="mini">暂停播放</button>
				<button @click="$refs.cSvgaRef.call('stopAnimation')" size="mini">停止播放</button>
			</view>
			<view>设置动画的拉伸模式</view>
			<view class="btnBox">
				<button @click="$refs.cSvgaRef.call('setContentMode','Fill')" size="mini">Fill</button>
				<button @click="$refs.cSvgaRef.call('setContentMode','AspectFill')" size="mini">AspectFill</button>
				<button @click="$refs.cSvgaRef.call('setContentMode','AspectFit')" size="mini">AspectFit</button>
			</view>
			<view>强制清空画布</view>
			<view class="btnBox">
				<button @click="$refs.cSvgaRef.call('clear')" size="mini">清空画布</button>
			</view>
			<view>跳到指定帧/百分比</view>
			<view class="btnBox">
				<button @click="$refs.cSvgaRef.call('stepToFrame',[40,true])" size="mini">跳到40帧</button>
				<button @click="$refs.cSvgaRef.call('stepToPercentage',[60,true])" size="mini">跳到60%</button>
			</view>
			<view>设定动态图像/动态文本</view>
			<view class="btnBox">
				<button @click="$refs.cSvgaRef.call('setImage',['/static/index/logo.png','06'])" size="mini">动态图像</button>
				<button @click="$refs.cSvgaRef.call('setText',[{text:'Hello, World!'},'08'])" size="mini">动态文本</button>
				<button @click="$refs.cSvgaRef.call('clearDynamicObjects')" size="mini">清空动态图像和文本</button>
			</view>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				canvasId:'myCanvas',
				src:'https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/b3875bda-8de0-476d-8f55-d10b24f16d98.svg'
			}
		},
		methods: {
			onFinished() {
				console.log('动画停止播放时回调');
			},
			onFrame(frame){//动画播放至某帧后回调
				// console.log(frame);
			},
			onPercentage(percentage){ //动画播放至某进度后回调
				// console.log(percentage);
			},
			onLoaded(){
				console.log('加载完成');
			}
		},
	}
	


	
</script>

<style lang="scss">
	.page{
		width: 100vw;
		overflow-x: hidden;
	}
	.content{
		padding: 20rpx;
		font-size: 28rpx;
	}
	.btnBox{
		width: 100%;
		display: flex;align-items: center;
		margin-top: 20rpx;
		margin-bottom: 30rpx;
	}
</style>
```
#### vue3
```html
<template>
	<view class="page">
		<c-svga ref="cSvgaRef" :canvasId='canvasId'
		 :src="src" 
		 :loops='0' :auto-play="true" @frame='onFrame' @finished='onFinished' @percentage='onPercentage' @loaded='onLoaded'></c-svga>
		<view class="content">
			<view>切换图像</view>
			<view class="btnBox">
				<button @click="src='https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/b3875bda-8de0-476d-8f55-d10b24f16d98.svg'" size="mini">小汽车</button>
				<button @click="src='https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/eebed809-b03e-4b90-88f8-5d6811b65f86.svg'" size="mini">玫瑰花</button>
			</view>
			<view>播放暂停</view>
			<view class="btnBox">
				<button @click="cSvgaRef.call('startAnimation')" size="mini">播放</button>
				<button @click="cSvgaRef.call('startAnimation',true)" size="mini">反向播放</button>
				<button @click="cSvgaRef.call('pauseAnimation')" size="mini">暂停播放</button>
				<button @click="cSvgaRef.call('stopAnimation')" size="mini">停止播放</button>
			</view>
			<view>设置动画的拉伸模式</view>
			<view class="btnBox">
				<button @click="cSvgaRef.call('setContentMode','Fill')" size="mini">Fill</button>
				<button @click="cSvgaRef.call('setContentMode','AspectFill')" size="mini">AspectFill</button>
				<button @click="cSvgaRef.call('setContentMode','AspectFit')" size="mini">AspectFit</button>
			</view>
			<view>强制清空画布</view>
			<view class="btnBox">
				<button @click="cSvgaRef.call('clear')" size="mini">清空画布</button>
			</view>
			<view>跳到指定帧/百分比</view>
			<view class="btnBox">
				<button @click="cSvgaRef.call('stepToFrame',[40,true])" size="mini">跳到40帧</button>
				<button @click="cSvgaRef.call('stepToPercentage',[60,true])" size="mini">跳到60%</button>
			</view>
			<view>设定动态图像/动态文本</view>
			<view class="btnBox">
				<button @click="cSvgaRef.call('setImage',['/static/index/logo.png','06'])" size="mini">动态图像</button>
				<button @click="cSvgaRef.call('setText',[{text:'Hello, World!'},'08'])" size="mini">动态文本</button>
				<button @click="cSvgaRef.call('clearDynamicObjects')" size="mini">清空动态图像和文本</button>
			</view>
		</view>
		
	</view>
</template>

<script setup>
	import { ref } from "vue";
	const cSvgaRef = ref(),canvasId='myCanvas'
	let src = ref('https://mp-eeab6da6-80cd-4e80-844a-66b2a7203834.cdn.bspapp.com/cloudstorage/b3875bda-8de0-476d-8f55-d10b24f16d98.svg')
	
	const onFinished=()=>{
		console.log('动画停止播放时回调');
	}
	const onFrame=(frame)=>{//动画播放至某帧后回调
		// console.log(frame);
	}
	const onPercentage=(percentage)=>{ //动画播放至某进度后回调
		// console.log(percentage);
	}
	const onLoaded=()=>{
		console.log('加载完成');
	}
	
</script>

<style lang="scss">
	.page{
		width: 100vw;
		overflow-x: hidden;
	}
	.content{
		padding: 20rpx;
		font-size: 28rpx;
	}
	.btnBox{
		width: 100%;
		display: flex;align-items: center;
		margin-top: 20rpx;
		margin-bottom: 30rpx;
	}
</style>
```

### 二、Props

| 字段				| 类型		| 必填	| 默认值				| 描述																																							|
| -----------		| --------	| ----	| ----------------------| -------------------------------	
| canvasId			| String	| 否|  'c'+uuid(18)	| canvasId 画布id 可不填此项																																	|
| width				| String	| 否|  750rpx		| 图像宽度 单位rpx/px																																			|
| height			| String	| 否|  750rpx		| 图像高度 单位rpx/px																																			|
| src				| String	| 是|				| svga文件地址																																					|
| autoPlay			| Boolean	| 否|  true			| 是否自动播放																																					|
| loops				| Number	| 否|  0			| 动画循环次数																																					|
| clearsAfterStop	| Boolean	| 否|  true			| 当动画结束时，是否清空画布																																	|
| fillMode			| String	| 否|Forward		| 默认值为 Forward，可选值 Forward / Backward，当 clearsAfterStop 为 false 时，Forward 表示动画会在结束后停留在最后一帧，Backward 则会在动画结束后停留在第一帧。|
| isOnChange		| Boolean	| 否|false			|false时不触发Frame Percentage监听																														|

### 三、Event
| 字段			| 描述										|
| ---------		| ------------------------					|
| loaded	| 监听svga文件加载完成				|
| finished	| 监听动画停止播放 loop!=0时生效				|
| frame		| 监听动画播放至某帧 isOnChange=true时生效	|
| percentage	| 监听动画播放至某进度 isOnChange=true时生效	|

### 四、Methods

#### 组件内方法统一使用 call(funName, args) 调用

```js
	this.$refs.cSvgaRef.call('startAnimation')
	//or
	const cSvgaRef = ref()
	cSvgaRef.value.call('startAnimation')
```

#### funName args入参为array类型 单个参数可传入string类型 

* constructor (canvas); - 传入 #id 或者 CanvasHTMLElement 至第一个参数
* startAnimation(reverse: boolean = false); - 从第 0 帧开始播放动画
* startAnimationWithRange(range: {location: number, length: number}, reverse: boolean = false); - 播放 [location, location+length] 指定区间帧动画
* pauseAnimation(); - 暂停在当前帧
* stopAnimation(); - 停止播放动画，如果 clearsAfterStop === true，将会清空画布
* setContentMode(mode: "Fill" | "AspectFill" | "AspectFit"); - 设置动画的拉伸模式
* setClipsToBounds(clipsToBounds: boolean); - 如果超出盒子边界，将会进行裁剪
* clear(); - 强制清空画布
* stepToFrame(frame: int, andPlay: Boolean); - 跳到指定帧，如果 andPlay === true，则在指定帧开始播放动画
* stepToPercentage(percentage: float, andPlay: Boolean); - 跳到指定百分比，如果 andPlay === true，则在指定百分比开始播放动画
* setImage(image: string, forKey: string, transform: [a, b, c, d, tx, ty]); - 设定动态图像, transform 是可选的, transform 用于变换替换图片
* setText(text: string | {text: string, family: string, size: string, color: string, offset: {x: float, y: float}}, forKey: string); - 设定动态文本
* clearDynamicObjects(); - 清空所有动态图像和文本

### 微信小程序端加载本地svga文件需要将文件后缀名调整为svg
### 暂不支持nvue nvue请使用性能更好的原生插件
### 注意：由于Hbuilderx上传插件无法上传node_odules依赖 导入插件后进入插件目录/uni_modules/c-svga   使用npm i 进行依赖安装 