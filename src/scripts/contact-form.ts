/**
 * Contact form, until the Gymdesk lead form replaces it: opens the visitor's
 * email app with a subject and a readable body, then shows the fallback note
 * (address and phone) in case no email app is set up.
 */
const form = document.querySelector<HTMLFormElement>('form[data-contact-form]');
const to = form?.dataset.contactForm;

if (form && to) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const value = (name: string) => String(data.get(name) ?? '').trim();

    const name = value('name');
    const details = [
      `Name: ${name}`,
      `Email: ${value('email')}`,
      value('phone') && `Phone: ${value('phone')}`,
      `Interested in: ${value('interest')}`,
    ].filter(Boolean);
    const body = `${value('message')}\n\n--\n${details.join('\n')}`;
    const subject = `Website message from ${name}`;

    // encodeURIComponent, not URLSearchParams: mail apps read "+" literally.
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.querySelector<HTMLElement>('[data-contact-sent]')?.removeAttribute('hidden');
  });
}
