class Circle {
  constructor({ origin, speed, color, angle, context, size }) {
    this.origin = origin
    // 小球的起始位置为原点
    this.position = { ...this.origin }
    // 小球的颜色
    this.color = color
    // 小球的速度
    this.speed = speed
    // 小球发射的角度
    this.angle = angle
    this.context = context
    // 绘制的帧数
    this.renderCount = 0
    // 大小
    this.size = size;
  }

  draw() {
    // 通过颜色、位置、绘制小球
    this.context.fillStyle = this.color
    this.context.beginPath()
    this.context.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
    this.context.fill()
  }

  move() {
    // 小球移动
    this.position.x = (Math.sin(this.angle) * this.speed) + this.position.x
    this.position.y = (Math.cos(this.angle) * this.speed) + this.position.y + (this.renderCount * 0.3)
    this.renderCount++
  }
}

class Boom {
  constructor({ origin, context, circleCount = 5, area, size = 10 }) {
    // 爆炸的原点
    this.origin = origin
    // canvas上下文
    this.context = context
    // 小球的数量
    this.circleCount = circleCount
    // 显示的区域
    this.area = area
    // 默认停止
    this.stop = false
    // 小球
    this.circles = []
    // 大小
    this.size = size;
  }
  // 通过数组取随机值
  randomArray(range) {
    const length = range.length
    const randomIndex = Math.floor(length * Math.random())
    return range[randomIndex]
  }
  // 随机颜色
  randomColor() {
    const range = ['8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
    return '#' + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range) + this.randomArray(range)
  }
  // 随机一个范围内的值
  randomRange(start, end) {
    return (end - start) * Math.random() + start
  }
  // 随机一个大小
  randomSize(start, end) {
    return (end - start) * Math.random()
  }

  // 初始化
  init() {
    // 创建小球
    for (let i = 0; i < this.circleCount; i++) {
      const circle = new Circle({
        context: this.context,
        origin: this.origin,
        color: this.randomColor(),
        angle: this.randomRange(Math.PI - 1, Math.PI + 1),
        speed: this.randomRange(1, 6),
        size: this.randomSize(2, this.size)
      })
      this.circles.push(circle)
    }
  }

  move() {
    // 循环推进每个小球的运动
    this.circles.forEach((circle, index) => {
      // 小球如果超过了可视范围，就删除该球
      if (circle.position.x > this.area.width || circle.position.y > this.area.height) {
        return this.circles.splice(index, 1)
      }
      circle.move()
    })
    // 如果所有的小球都被删除，就把这个boom标记为停止，等待下一帧被删除
    if (this.circles.length == 0) {
      this.stop = true
    }
  }

  draw() {
    // 循环绘制每个小球
    this.circles.forEach(circle => circle.draw())
  }
}


class CursorSpecialEffects {
  constructor() {
    this.computerCanvas = document.createElement('canvas')
    this.renderCanvas = document.createElement('canvas')

    this.computerContext = this.computerCanvas.getContext('2d')
    this.renderContext = this.renderCanvas.getContext('2d')
    this.runing = false // 标识特效是否在运行
    this.booms = [] // 可以同时存在多个特效，所以使用数组来保存
    this.height = window.innerHeight;
  }
  // 初始化
  init() {
    // 设置canvas样式
    const style = this.renderCanvas.style
    style.position = 'fixed'
    style.top = style.left = 0
    style.zIndex = '999'
    style.pointerEvents = 'none'

    style.width = this.renderCanvas.width = this.computerCanvas.width = window.innerWidth
    style.height = this.renderCanvas.height = this.computerCanvas.height = this.height
    // 挂载到页面上
    document.body.append(this.renderCanvas)
    window.addEventListener('mousemove', this.handleMouseMove.bind(this))
    window.addEventListener('mousedown', this.handleMouseDown.bind(this))
  }

  // 鼠标事件
  handleMouseDown(e) {
    const boom = new Boom({
      // 爆炸的原点
      origin: { x: e.clientX, y: e.clientY },
      // canvas上下文
      context: this.computerContext,
      // 场景区域，当特效超出场景范围时，就应该停止了
      area: {
        width: window.innerWidth,
        height: this.height
      },
      circleCount: 100,
      size: 30,
    })
    boom.init()
    this.booms.push(boom)
    // 如果特效已经在运行，则不重复开始
    this.running || this.run()
  }


  // 鼠标事件
  handleMouseMove(e) {
    const boom = new Boom({
      // 爆炸的原点
      origin: { x: e.clientX, y: e.clientY },
      // canvas上下文
      context: this.computerContext,
      // 场景区域，当特效超出场景范围时，就应该停止了
      area: {
        width: window.innerWidth,
        height: this.height
      }
    })
    boom.init()
    this.booms.push(boom)
    // 如果特效已经在运行，则不重复开始
    this.running || this.run()
  }

  run() {
    // 特效已经开始了
    this.running = true
    if (this.booms.length == 0) {
      // 如果所有的爆炸都消失了，则特效停止
      return this.running = false
    }
    // 每一帧都运行一次，刷新动画
    requestAnimationFrame(this.run.bind(this))
    // 每次绘制之前都先清空画布
    this.computerContext.clearRect(0, 0, window.innerWidth, this.height)
    this.renderContext.clearRect(0, 0, window.innerWidth, this.height)
    this.booms.forEach((boom, index) => {
      // 如果爆炸停止，则将它从特效中移除
      if (boom.stop) {
        return this.booms.splice(index, 1)
      }
      // 爆炸每有一点进展，就绘制一次
      boom.move()
      boom.draw()
    })
    // 一帧绘制完毕，将计算使用的canvas绘制到页面的canvas上
    this.renderContext.drawImage(this.computerCanvas, 0, 0, window.innerWidth, this.height)
  }

}

window.onload = function () {
  const cursorSpecialEffects = new CursorSpecialEffects()
  cursorSpecialEffects.init()
}

