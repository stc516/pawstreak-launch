import assert from 'node:assert/strict'
import { isNativeCameraCancellation } from '../src/lib/nativePhotoErrors.ts'

const cases = [
  [new Error('User cancelled photos app'), true, 'Capacitor iOS camera Cancel'],
  [new Error('User canceled photos app'), true, 'Capacitor alternate spelling'],
  [new Error('Cancelled.'), true, 'short cancellation'],
  [{ code: 'USER_CANCELLED', message: 'Camera dismissed' }, true, 'cancel error code'],
  [{ code: 'USER_CANCELED' }, true, 'alternate cancel code'],
  [new Error('Camera permissions denied'), false, 'permission denied must surface'],
  [new Error('Could not read captured photo.'), false, 'missing photo must surface'],
  [new Error('Camera capture failed'), false, 'real capture error must surface'],
  [new Error('Camera operation cancelled because permission was denied'), false, 'ambiguous failure must surface'],
  [null, false, 'no error'],
  ['User cancelled photos app', false, 'bare string is not a plugin error'],
  [{ message: 42 }, false, 'malformed plugin error'],
]

for (const [error, expected, label] of cases) {
  assert.equal(isNativeCameraCancellation(error), expected, label)
}
console.log(`[PASS] ${cases.length}/${cases.length} native camera cancellation cases`)
