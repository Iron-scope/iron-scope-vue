<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

/**
 * Port of app/components/Medallion3D.js (mitigation-platform) -- a real 3D
 * spinning coin/medallion rendered with Three.js, not a flat plane faking a
 * squash. Same geometry, lighting, and texture-mapping approach, translated
 * from React's useEffect lifecycle to onMounted/onBeforeUnmount.
 *
 * The source PNG is cropped precisely to the ring's own true circular
 * boundary (see the original component's comment), so the ring coincides
 * with the cylinder cap's edge at every angle -- no runtime zoom needed,
 * and no flat/chopped edges show through, because the cap's circular UV
 * mapping crops away the texture's flat corners.
 */
const props = defineProps({
  imageSrc: { type: String, default: '/ironscope-seal-opaque-v3.png' },
  size: { type: Number, default: 140 },
  spinSeconds: { type: Number, default: 9 },
  rimColor: { type: String, default: '#163c5d' },
  rimColorHighlight: { type: String, default: '#4a7bae' },
})

const containerRef = ref(null)
let renderer, animationId
let disposed = false

onMounted(() => {
  if (typeof window === 'undefined' || !containerRef.value) return

  import('three').then((THREE) => {
    if (disposed || !containerRef.value) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0.55, 4.2)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3))
    renderer.setSize(props.size, props.size)
    renderer.setClearColor(0x000000, 0)
    containerRef.value.innerHTML = ''
    containerRef.value.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(2, 3, 4)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.4)
    fill.position.set(-3, -1, 2)
    scene.add(fill)
    const rim = new THREE.DirectionalLight(0xaecbe8, 0.8)
    rim.position.set(-1, 2, -3)
    scene.add(rim)

    const texture = new THREE.TextureLoader().load(props.imageSrc)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.center.set(0.5, 0.5)
    texture.rotation = Math.PI / 2
    texture.generateMipmaps = false
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()

    const faceMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.55,
      metalness: 0.15,
    })
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: props.rimColor,
      roughness: 0.2,
      metalness: 0.8,
      emissive: new THREE.Color(props.rimColorHighlight),
      emissiveIntensity: 0.15,
    })

    const geometry = new THREE.CylinderGeometry(1, 1, 0.16, 64)
    const coin = new THREE.Mesh(geometry, [rimMaterial, faceMaterial, faceMaterial])
    coin.rotation.x = Math.PI / 2

    const spinGroup = new THREE.Group()
    spinGroup.rotation.x = -0.18
    spinGroup.add(coin)
    scene.add(spinGroup)

    const clock = new THREE.Clock()
    const radiansPerSecond = (Math.PI * 2) / props.spinSeconds

    function animate() {
      if (disposed) return
      const delta = clock.getDelta()
      spinGroup.rotation.y += radiansPerSecond * delta
      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      renderer.render(scene, camera)
    } else {
      animate()
    }
  })
})

onBeforeUnmount(() => {
  disposed = true
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    if (containerRef.value) containerRef.value.innerHTML = ''
  }
})
</script>

<template>
  <div ref="containerRef" :style="{ width: size + 'px', height: size + 'px' }" aria-hidden="true" />
</template>
