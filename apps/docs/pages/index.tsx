import { Button, Input } from 'ui'

import pk from '../package.json'

export default function Docs() {
  return (
    <div>
      <h1>Docs</h1>
      <p>Version {pk.version}</p>
      <Button />
      <Input />
    </div>
  )
}

// comment
