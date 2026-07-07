import type { Rotation } from '../game/types'
import styles from './ImageCard.module.css'

interface ImageCardProps {
  src: string
  rotation: Rotation
  alt?: string
}

/**
 * Displays a dataset image at a given rotation. Rotation is a pure CSS
 * transform applied at render time — the underlying image data is never
 * mutated. `src` is dataset-relative; we prefix the app base URL so it resolves
 * correctly under GitHub Pages' /<repo>/ path.
 */
export function ImageCard({ src, rotation, alt = 'Estimate the shaded area' }: ImageCardProps) {
  const url = import.meta.env.BASE_URL + src
  return (
    <div className={styles.area}>
      <div className={styles.frame}>
        <img
          className={styles.image}
          src={url}
          alt={alt}
          draggable={false}
          style={{ transform: `rotate(${rotation}deg)` }}
        />
      </div>
    </div>
  )
}
