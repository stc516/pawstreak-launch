import { registerPlugin } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { getNativePlatform } from './nativeRuntime'
import type { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation'
const driver = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation')

// Cleanup also handles Pause/Cancel occurring before addWatcher resolves.
export function watchNativeRoute(onPoint: (point: GeolocationPosition) => void, onError: (message: string) => void, api: Pick<BackgroundGeolocationPlugin, 'addWatcher' | 'removeWatcher'> = driver) {
  let stopped = false
  let removed = false
  const watcher = (async () => {
    if (getNativePlatform() === 'android' && (await LocalNotifications.requestPermissions()).display !== 'granted') throw new Error('Allow the walk recording notification first.')
    if (stopped) return null
    return api.addWatcher({ backgroundTitle: 'PawStreak walk', backgroundMessage: 'Recording your chosen walk route. Pause or finish the walk in PawStreak to stop.', requestPermissions: true, stale: false, distanceFilter: 10 }, (location, error) => {
    if (stopped) return
    if (error) { onError(error.code === 'NOT_AUTHORIZED' ? 'Location permission denied. Your walk can still be saved.' : 'GPS recording interrupted. Reopen PawStreak to check permissions.'); return }
    if (!location || !location.time || Date.now() - location.time > 60000) return
    onPoint({ timestamp: location.time, coords: { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy, altitude: location.altitude, altitudeAccuracy: location.altitudeAccuracy, heading: location.bearing, speed: location.speed } } as GeolocationPosition)
  })
  })()
  const stop = async () => {
    stopped = true
    const id = await watcher.catch(() => null)
    if (!id || removed) return
    try { await api.removeWatcher({ id }); removed = true }
    catch {
      try { await api.removeWatcher({ id }); removed = true }
      catch { onError('GPS could not stop. Close PawStreak or turn off its location permission in Settings.'); }
    }
  }
  void watcher.catch(() => { if (!stopped) onError('GPS recording could not start. Check location permission and try again.') })
  return stop
}
