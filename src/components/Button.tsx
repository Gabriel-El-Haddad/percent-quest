import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  full?: boolean
}

export function Button({
  variant = 'primary',
  full = false,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    full ? styles.full : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
  return <button className={classes} {...rest} />
}
