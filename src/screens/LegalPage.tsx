import type { ReactNode } from 'react'
import { BrandLogoCircle } from '../components/BrandLogoCircle'
import { ROUTES } from '../lib/routes'

const CONTACT = 'hello@pawstreakapp.com'

function Layout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <a href={ROUTES.landing} aria-label="PawStreak home">
          <BrandLogoCircle size={58} />
        </a>
        <a className="legal-back" href={ROUTES.landing}>Back to PawStreak</a>
      </header>
      <main className="legal-card">
        <p className="legal-kicker">PawStreak</p>
        <h1>{title}</h1>
        <p className="legal-updated">Last updated July 13, 2026</p>
        {children}
      </main>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <Layout title="Privacy Policy">
      <p>PawStreak helps dog parents plan adventures and save memories. This policy explains the information we handle and the choices available to you.</p>
      <h2>Information we collect</h2>
      <p>When you create an account, we receive your email address and the profile details you provide. PawStreak may store dog profiles, approximate location or ZIP code, adventures, notes, photos, saved memories, Pack Access membership, feedback, and basic product-use events.</p>
      <h2>How we use information</h2>
      <p>We use this information to operate and personalize PawStreak, keep your data synchronized, show nearby suggestions, support shared packs, improve reliability, prevent abuse, and respond to support requests. We do not sell personal information.</p>
      <h2>Location and photos</h2>
      <p>Location access is optional. When used during an adventure, location details help describe the outing. Photos you upload are stored privately and accessed with time-limited links. You can deny device permissions and continue using other features.</p>
      <h2>Notifications</h2>
      <p>Push notifications are optional. If you enable them, we store a device push endpoint, delivery keys, timezone, and your chosen reminder schedule so we can send the reminders you request. You can pause reminders in PawStreak Settings or withdraw notification permission in your device settings.</p>
      <h2>Service providers</h2>
      <p>We use service providers including Supabase for authentication and data storage, Vercel for hosting, Mapbox for maps and geocoding, and Resend for transactional email. They process information only to provide their services to PawStreak.</p>
      <h2>Retention and deletion</h2>
      <p>We retain account information while your account is active and as needed for security, backups, fraud prevention, and legal obligations. You can delete your account in Settings or request deletion from our <a href={ROUTES.deleteAccount}>account deletion page</a>. Deletion removes the account and associated PawStreak profile data unless retention is legally required.</p>
      <h2>Your choices</h2>
      <p>You may update dog and location information in the app, withdraw device permissions in system settings, request access or correction, or delete your account.</p>
      <h2>Contact</h2>
      <p>Privacy questions can be sent to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </Layout>
  )
}

export function TermsPage() {
  return (
    <Layout title="Terms of Service">
      <p>These terms govern your use of PawStreak. By creating an account or using the service, you agree to these terms.</p>
      <h2>Using PawStreak</h2>
      <p>You must provide accurate account information, protect your login, use PawStreak lawfully, and be responsible for activity under your account. You may not abuse the service, interfere with its operation, access another person’s data, or upload unlawful or harmful content.</p>
      <h2>Outdoor information</h2>
      <p>PawStreak provides planning suggestions, not veterinary, safety, legal, or professional advice. Conditions, access rules, leash requirements, weather, and hazards can change. Confirm posted rules and make decisions appropriate for you and your dog.</p>
      <h2>Your content</h2>
      <p>You retain ownership of photos, notes, and other content you submit. You give PawStreak permission to store, process, and display that content only as needed to provide and improve the service.</p>
      <h2>Availability</h2>
      <p>PawStreak may change, suspend, or discontinue features. The service is provided as available, and we cannot guarantee uninterrupted or error-free operation.</p>
      <h2>Termination</h2>
      <p>You may stop using PawStreak or delete your account at any time. We may restrict accounts that violate these terms or create risk for other users or the service.</p>
      <h2>Contact</h2>
      <p>Questions about these terms can be sent to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </Layout>
  )
}

export function SupportPage() {
  return (
    <Layout title="Support">
      <p>Need help with your account, a saved memory, Pack Access, or a problem in the app?</p>
      <p>Email <a href={`mailto:${CONTACT}?subject=PawStreak%20Support`}>{CONTACT}</a> with the device you are using, what you expected to happen, and any helpful screenshot. Do not include your password or private invite token.</p>
      <p>For privacy or deletion requests, use the <a href={ROUTES.deleteAccount}>account deletion page</a>.</p>
    </Layout>
  )
}

export function DeleteAccountPage() {
  return (
    <Layout title="Delete your PawStreak account">
      <p>Signed-in users can permanently delete their account from Profile → Settings → Delete account.</p>
      <p>If you cannot access the app, email <a href={`mailto:${CONTACT}?subject=PawStreak%20Account%20Deletion%20Request`}>{CONTACT}</a> from the address used for your PawStreak account. Include “Account deletion request” in the subject. We may ask you to verify account ownership.</p>
      <p>Deletion removes your PawStreak account, dog profiles, adventures, memories, pack membership, and stored photos, except information we must retain for security, fraud prevention, or legal obligations.</p>
    </Layout>
  )
}
