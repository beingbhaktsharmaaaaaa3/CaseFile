/* Admin gate config.
   IMPORTANT: This is a soft, client-side deterrent only — NOT real security.
   Anyone with access to these files can read the source and bypass this check.
   If you need real protection, keep the GitHub repo private, or put the
   whole site behind Cloudflare Access / a Netlify password / basic auth
   at the hosting layer instead.

   To change the password:
   1. Open a browser console on any page of this site.
   2. Run: await hashPassword("your-new-password")
   3. Copy the printed hash into ADMIN_PASSWORD_HASH below.
*/
window.ADMIN_PASSWORD_HASH = "057ba03d6c44104863dc7361fe4578965d1887360f90a0895882e58a6248fc86"; // default: "changeme"

async function hashPassword(pw) {
  const enc = new TextEncoder().encode(pw);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('New hash:', hex);
  return hex;
}
