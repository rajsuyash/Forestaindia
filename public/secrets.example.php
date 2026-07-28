<?php
/**
 * Copy to `secrets.php` ON THE SERVER ONLY and fill in.
 * secrets.php is gitignored and is never uploaded from the repo —
 * scripts/deploy.sh explicitly excludes it so a deploy can't wipe it.
 */

return [
    // GoDaddy hosts this domain's mail, not Hostinger. Sending via Hostinger
    // would fail the domain's SPF record and hit DMARC p=quarantine.
    'smtp_host'  => 'smtpout.secureserver.net',
    'smtp_port'  => 465,
    'smtp_user'  => 'niravm@forestaindia.com',
    'smtp_pass'  => '',
    'contact_to' => 'niravm@forestaindia.com',
];
