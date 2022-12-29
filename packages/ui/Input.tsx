import * as React from 'react'

interface InputProps extends React.HTMLAttributes<HTMLInputElement> {}

export const Input = (props: InputProps) => {
  return <input {...props} style={{ color: 'red' }} />
}
