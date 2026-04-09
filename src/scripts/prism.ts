import * as THREE from 'three'

interface PostData {
  id: string
  title: string
  url: string
  category: string
}

const CATEGORY_COLORS: Record<string, string> = {
  general: '#ffb347',
  information: '#00c8c8',
  instructions: '#cc44ff'
}

const CATEGORY_ARCS: Record<string, [number, number]> = {
  general:      [0,   120],
  information:  [120, 240],
  instructions: [240, 360]
}

const CATEGORIES = ['general', 'information', 'instructions']

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

export function initPrism() {
  const wrapper = document.getElementById('prism-wrapper')
  const canvas = document.getElementById('prism-canvas') as HTMLCanvasElement | null
  const beamsDiv = document.getElementById('post-beams')
  if (!canvas || !wrapper || !beamsDiv) return

  const postsRaw = wrapper.dataset.posts || '[]'
  const posts: PostData[] = JSON.parse(postsRaw)

  // Three.js scene
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 0, 5)

  scene.add(new THREE.AmbientLight(0xffffff, 0.4))
  const pointLight = new THREE.PointLight(0xffffff, 2, 20)
  pointLight.position.set(3, 3, 3)
  scene.add(pointLight)

  // Triangular prism: 3-sided cylinder
  const prismGeo = new THREE.CylinderGeometry(1, 1, 2.5, 3, 1, false)

  const faceMaterials = CATEGORIES.map((cat) =>
    new THREE.MeshPhongMaterial({
      color: new THREE.Color(CATEGORY_COLORS[cat]),
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      shininess: 80,
      specular: new THREE.Color(0xffffff)
    })
  )
  const capMat = new THREE.MeshPhongMaterial({ color: 0x888888, transparent: true, opacity: 0.3 })
  const mesh = new THREE.Mesh(prismGeo, [...faceMaterials, capMat, capMat])
  scene.add(mesh)

  // Rainbow sweep plane behind prism
  const w = 256, h = 32
  const data = new Uint8Array(w * h * 4)
  for (let x = 0; x < w; x++) {
    const hue = (x / w) * 360
    const [r, g, b] = hslToRgb(hue / 360, 1, 0.6)
    for (let y = 0; y < h; y++) {
      const i = (y * w + x) * 4
      const alpha = Math.sin((y / h) * Math.PI) * 200
      data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = alpha
    }
  }
  const rainbowTex = new THREE.DataTexture(data, w, h)
  rainbowTex.needsUpdate = true

  const rainbowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 0.4),
    new THREE.MeshBasicMaterial({ map: rainbowTex, transparent: true, depthWrite: false })
  )
  rainbowPlane.position.set(0, 0, -0.5)
  scene.add(rainbowPlane)

  // Interaction
  let isDragging = false
  let prevX = 0
  let prismAngle = 0

  canvas.addEventListener('pointerdown', (e) => { isDragging = true; prevX = e.clientX })
  window.addEventListener('pointerup', () => { isDragging = false })
  window.addEventListener('pointermove', (e) => {
    if (!isDragging) return
    prismAngle += (e.clientX - prevX) * 0.01
    mesh.rotation.y = prismAngle
    prevX = e.clientX
    updateBeams(prismAngle)
  })

  canvas.addEventListener('touchstart', (e) => {
    isDragging = true; prevX = e.touches[0].clientX
  }, { passive: true })
  window.addEventListener('touchend', () => { isDragging = false })
  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return
    prismAngle += (e.touches[0].clientX - prevX) * 0.01
    mesh.rotation.y = prismAngle
    prevX = e.touches[0].clientX
    updateBeams(prismAngle)
  }, { passive: true })

  // Build beam DOM elements
  const isMobile = window.innerWidth < 768
  const beamEls: { el: HTMLElement; cat: string }[] = []

  const grouped: Record<string, PostData[]> = {}
  for (const p of posts) {
    const cat = p.category || 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(p)
  }

  for (const cat of CATEGORIES) {
    const catPosts = grouped[cat] || []
    const [arcStart, arcEnd] = CATEGORY_ARCS[cat]
    const color = CATEGORY_COLORS[cat]

    catPosts.forEach((post, idx) => {
      const t = catPosts.length === 1 ? 0.5 : idx / (catPosts.length - 1)
      const angleDeg = arcStart + t * (arcEnd - arcStart)
      const beamLength = isMobile
        ? Math.min(window.innerWidth, window.innerHeight) * 0.38
        : 260

      const beamWrapper = document.createElement('a')
      beamWrapper.href = post.url
      beamWrapper.title = post.title
      beamWrapper.setAttribute('style', [
        'position:absolute',
        'left:50%',
        'top:50%',
        'width:0',
        'height:0',
        'transform-origin:0 0',
        `transform:rotate(${angleDeg - 90}deg)`,
        'pointer-events:none'
      ].join(';'))

      const line = document.createElement('div')
      line.setAttribute('style', [
        'position:absolute',
        'left:0',
        'top:-1px',
        `width:${beamLength}px`,
        'height:2px',
        `background:linear-gradient(to right,${color}cc,${color}00)`,
        'pointer-events:auto',
        'transition:opacity 400ms ease'
      ].join(';'))

      if (!isMobile) {
        const label = document.createElement('span')
        const labelText = post.title.length > 22 ? post.title.slice(0, 22) + '\u2026' : post.title
        label.textContent = labelText
        label.setAttribute('style', [
          'position:absolute',
          `left:${beamLength + 6}px`,
          'top:-0.6em',
          `color:${color}`,
          "font-family:'Noto Sans',sans-serif",
          'font-size:0.75rem',
          'white-space:nowrap',
          'pointer-events:auto',
          'text-shadow:0 1px 4px rgba(0,0,0,0.8)',
          'transition:opacity 400ms ease'
        ].join(';'))
        beamWrapper.appendChild(label)
      }

      beamWrapper.appendChild(line)
      beamsDiv.appendChild(beamWrapper)
      beamEls.push({ el: beamWrapper, cat })
    })
  }

  function updateBeams(rotation: number) {
    const rotDeg = ((rotation * (180 / Math.PI)) % 360 + 360) % 360
    const faceAngles = [0, 120, 240]
    const facingCatIdx = faceAngles
      .map((fa, i) => ({ i, diff: Math.abs(((rotDeg + fa + 180) % 360) - 180) }))
      .sort((a, b) => a.diff - b.diff)[0].i
    const facingCat = CATEGORIES[facingCatIdx]

    beamEls.forEach(({ el, cat }) => {
      el.style.opacity = cat === facingCat ? '1' : '0.15'
    })

    // Slide rainbow plane
    rainbowPlane.rotation.z = rotation * 0.3
  }
  updateBeams(0)

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // Animation loop
  let frameId: number
  function animate() {
    frameId = requestAnimationFrame(animate)
    if (!isDragging) {
      prismAngle += 0.003
      mesh.rotation.y = prismAngle
      updateBeams(prismAngle)
    }
    rainbowPlane.position.x = Math.sin(Date.now() * 0.001) * 0.5
    renderer.render(scene, camera)
  }
  animate()

  // Clean up on Astro page transitions
  document.addEventListener('astro:before-swap', () => {
    cancelAnimationFrame(frameId)
    renderer.dispose()
  }, { once: true })
}
