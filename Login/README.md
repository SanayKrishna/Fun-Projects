Complex Animated Login (Concise)
Overview

Front-end-only login with 3D card flip to a demo Sign up.

Glassmorphism, particle background, parallax tilt, ink ripple.

Caps Lock warning, password strength meter, themed links.

“Remember me” strictly controls card glow (on when checked, off when unchecked).

Sign up validates but does not store accounts.

Dummy credentials only: demo/SuperSecret!123, neo/ThereIsNoSpoon_42, admin/P@ssw0rd!P@ssw0rd!

Key UI pieces and what powers them

3D flip (Login ↔ Sign up)

flipTo(side): toggles a .flipped class on the flip container and switches focus/ARIA.

Parallax tilt (card hover)

Mousemove on the card computes cursor offset and sets rotateX/rotateY transforms.

Mouseleave resets transform.

Particle background (canvas)

resize(): matches canvas to viewport.

makeParticles(n): creates moving dots.

tick(): animation loop to update/draw particles.

Password strength meter

strength(s): returns score 0–5 based on length/upper/lower/digit/symbol.

updateMeter(input, bar): sets width/color based on score.

Caps Lock warning

capsHandler(e): uses getModifierState('CapsLock') on key events in the password field.

showCaps()/hideCaps(): shows/hides the toast.

Remember me glow

applyRememberGlow(): adds/removes .glow on the card strictly from checkbox state.

Initialized from current checkbox, updated on change only.

Ink ripple (buttons)

ripple(btn, e): positions a radial gradient via CSS variables from click coordinates.

Demo auth (no storage)

verifyCredentials(user, pass): checks only hardcoded accounts.

accountExists(user): “Check account” against the same list.

Usage

Open index.html in a modern browser.

Test with the dummy credentials listed above.

Create Account is demo-only: validates, shows a toast, flips back—no account is saved.

Notes

Login spacing tuned for clear separation between title, subtitle, inputs, and hints.

Themed links (not default blue) to match the neon-accent design.

Accessible: live region for status, focus management on flip, reduced-motion support.
