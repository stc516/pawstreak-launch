import { Resend } from 'npm:resend@4.1.2'

const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'PawStreak <hello@pawstreakapp.com>'

const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendPackInviteEmail(input: {
  to: string
  role: string
  inviteUrl: string
}) {
  if (!resend) {
    console.warn('RESEND_API_KEY missing; skipped Pack Access invite email.')
    return { skipped: true }
  }

  const result = await resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject: 'You were invited to a PawStreak pack',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#1b1f1d;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="font-family:Georgia,serif;color:#172033">Join a PawStreak pack</h1>
        <p>You were invited as a <strong>${input.role}</strong> so you can share in a dog's adventures, memories, and milestones.</p>
        <p><a href="${input.inviteUrl}" style="display:inline-block;background:#1b3022;color:white;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Accept invite</a></p>
        <p style="color:#66736b;font-size:14px">This invite expires in 14 days.</p>
      </div>
    `,
    text: `Join a PawStreak pack as a ${input.role}: ${input.inviteUrl}`,
  })

  if (result.error) {
    throw new Error(result.error.message || 'Pack invite email could not be sent.')
  }

  return result
}

export async function sendPackWelcomeEmail(input: { to: string; role: string }) {
  if (!resend) {
    console.warn('RESEND_API_KEY missing; skipped Pack Access welcome email.')
    return { skipped: true }
  }

  const result = await resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject: 'Welcome to the pack',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.55;color:#1b1f1d;max-width:560px;margin:0 auto;padding:24px">
        <h1 style="font-family:Georgia,serif;color:#172033">Welcome to PawStreak</h1>
        <p>Your Pack Access invite was accepted. You now have <strong>${input.role}</strong> access.</p>
        <p>You can open PawStreak to view the pack, join adventures, and help save memories based on your permissions.</p>
        <p><a href="https://pawstreakapp.com/app" style="display:inline-block;background:#1b3022;color:white;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700">Open PawStreak</a></p>
      </div>
    `,
    text: `Welcome to PawStreak. Your Pack Access invite was accepted with ${input.role} access.`,
  })

  if (result.error) {
    throw new Error(result.error.message || 'Pack welcome email could not be sent.')
  }

  return result
}
