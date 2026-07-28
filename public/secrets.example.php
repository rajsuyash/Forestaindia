<?php
/**
 * Copy to `secrets.php` ON THE SERVER ONLY and fill in.
 * secrets.php is gitignored and is never uploaded from the repo —
 * scripts/deploy.sh explicitly excludes it so a deploy can't wipe it.
 */

return [
    'smtp_host'  => 'smtp.hostinger.com',
    'smtp_port'  => 465,
    'smtp_user'  => 'niravm@forestaindia.com',
    'smtp_pass'  => '',
    'contact_to' => 'niravm@forestaindia.com',
];
