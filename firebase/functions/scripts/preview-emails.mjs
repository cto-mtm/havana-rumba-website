/**
 * Render the email templates with sample data for visual review.
 *
 * Usage: npm run preview:emails   (builds first, then runs this)
 * Output: preview/notification.html, preview/confirmation.html
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Compiled output is CommonJS — load it with require().
const { buildNotificationEmail } = require(join(root, 'lib/templates/notificationEmail.js'));
const { buildConfirmationEmail } = require(join(root, 'lib/templates/confirmationEmail.js'));
const formConfigs = require(join(root, 'lib/models.js')).default;

const formType = process.argv[2] ?? 'contact';
const config = formConfigs[formType];
if (!config) {
  console.error(`Unknown form type "${formType}". Valid: ${Object.keys(formConfigs).join(', ')}`);
  process.exit(1);
}

const sample = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1 555 0100',
  message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nSecond line <b>with HTML</b> to check escaping.',
};

const outDir = join(root, 'preview');
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, 'notification.html'), buildNotificationEmail(config, sample));
writeFileSync(join(outDir, 'confirmation.html'), buildConfirmationEmail(config));

console.log(`✓ Wrote previews for "${formType}" to ${outDir}`);
