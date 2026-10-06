const forms = document.querySelectorAll<HTMLFormElement>('[data-book-news-form]')
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

for (const form of forms) {
  const email = form.elements.namedItem('email') as HTMLInputElement | null
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')
  const status = form.querySelector<HTMLElement>('[data-signup-status]')

  if (!email || !submit || !status) continue

  submit.disabled = false

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const value = email.value.trim()

    if (!emailPattern.test(value)) {
      status.textContent = 'Please enter a valid email address.'
      email.focus()
      return
    }

    submit.disabled = true
    status.textContent = 'Joining…'

    if (!supabaseUrl || !supabaseKey) {
      status.textContent = 'Signup is temporarily unavailable. Please try again soon.'
      submit.disabled = false
      return
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/waitlist_signups`, {
        method: 'POST',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ email: value, source: 'bailey_omi_book_news' }),
      })

      if (response.ok) {
        status.textContent = 'You’re in! We’ll share Bailey & Omi book news with you.'
        form.reset()
      } else if (response.status === 409) {
        status.textContent = 'You’re already on the list — thank you!'
        form.reset()
      } else {
        status.textContent = 'We couldn’t add you just now. Please try again.'
      }
    } catch {
      status.textContent = 'We couldn’t add you just now. Please try again.'
    }

    submit.disabled = false
  })
}
