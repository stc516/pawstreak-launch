import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import ts from 'typescript'

// Exercise the real capture adapter with device responses, without a camera or
// gallery permission prompt. Device QA still verifies the native plugin itself.
let native = true
let response
let failure
let calls = 0
const modules = {
  '@capacitor/camera': {
    Camera: {
      async getPhoto(options) {
        calls += 1
        assert.equal(options.saveToGallery, true)
        assert.equal(options.resultType, 'dataUrl')
        assert.equal(options.source, 'CAMERA')
        if (failure) throw failure
        return response
      },
    },
    CameraResultType: { DataUrl: 'dataUrl' },
    CameraSource: { Camera: 'CAMERA' },
  },
  './nativeRuntime': { isNativeAppRuntime: () => native },
}
const { outputText } = ts.transpileModule(await readFile('src/lib/nativePhotos.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
})
const exports = {}
vm.runInNewContext(outputText, {
  exports,
  require(name) {
    assert.ok(Object.hasOwn(modules, name), `Unexpected dependency: ${name}`)
    return modules[name]
  },
})
const { captureNativeAdventurePhoto } = exports
const dataUrl = 'data:image/jpeg;base64,cGhvdG8='
for (const saved of [true, false, undefined]) {
  response = { dataUrl, saved }
  const result = await captureNativeAdventurePhoto()
  assert.equal(result.dataUrl, dataUrl, 'Keep the memory photo even without a gallery copy')
  assert.equal(result.savedToGallery, saved === true, 'Only confirm a gallery copy when the device confirms it')
}
response = { saved: true }
await assert.rejects(captureNativeAdventurePhoto(), /Could not read captured photo/)
failure = new Error('Camera permission denied')
await assert.rejects(captureNativeAdventurePhoto(), /Camera permission denied/)
native = false
const callsBeforeWeb = calls
assert.equal(await captureNativeAdventurePhoto(), null, 'Keep the web file-picker fallback')
assert.equal(calls, callsBeforeWeb, 'Web must not request a native camera')
console.log('[PASS] Native photo capture: truthful gallery status, retained photo, errors, and web fallback')
