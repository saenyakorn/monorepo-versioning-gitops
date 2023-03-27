import { Button } from 'ui'

import pk from '../package.json'

export default function Web() {
  return (
    <div>
      <h1>Hello Web developer</h1>
      <p>Version {pk.version}</p>
      <Button />
    </div>
  )
}
