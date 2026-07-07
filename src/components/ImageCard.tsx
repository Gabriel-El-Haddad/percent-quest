import type { Rotation } from '../game/types'
import styles from './ImageCard.module.css'

interface ImageCardProps {
  src: string
  rotation: Rotation
  alt?: string
}

/**
 * Displays an image at a given rotation. Rotation is a pure CSS transform
 * applied at render time — the underlying image data is never mutated.
 * Procedurally-generated images arrive as inline `data:` URLs and are used as-is;
 * a dataset-relative path is prefixed with the app base URL so it resolves under
 * GitHub Pages' /<repo>/ path.
 */
export function ImageCard({ src, rotation, alt = 'Estimate the shaded area' }: ImageCardProps) {
  const url = src.startsWith('data:') ? src : import.meta.env.BASE_URL + src
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
