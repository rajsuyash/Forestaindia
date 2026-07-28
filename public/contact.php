<?php
/**
 * Foresta India — enquiry handler.
 *
 * Server-side validation mirrors src/lib/enquiry.ts. The browser copy exists
 * for fast feedback; THIS file is the authority. Never trust the client.
 *
 * Credentials are read from secrets.php, which sits next to this file on the
 * server and is gitignored. Copy secrets.example.php to secrets.php and fill
 * it in during deployment.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function fail(string $message, int $code = 400): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

function succeed(): never {
    echo json_encode(['ok' => true]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail('Method not allowed.', 405);
}

$secretsPath = __DIR__ . '/secrets.php';
if (!is_readable($secretsPath)) {
    error_log('contact.php: secrets.php missing');
    fail('The contact form is not configured yet. Please email us directly.', 500);
}
/** @var array{smtp_host:string,smtp_port:int,smtp_user:string,smtp_pass:string,contact_to:string} $config */
$config = require $secretsPath;

// ── Bot traps ───────────────────────────────────────────────────────────
// Both are silent successes: a bot that knows it failed just adapts.
if (trim((string) ($_POST['company_website'] ?? '')) !== '') {
    succeed();
}
if ((int) ($_POST['elapsed'] ?? 0) < 3000) {
    succeed();
}

// ── Rate limit ──────────────────────────────────────────────────────────
// Crude per-IP throttle in the system temp dir. ponytail: file-based is fine
// at this volume; move to Redis only if enquiries ever outgrow one server.
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$throttleFile = sys_get_temp_dir() . '/foresta_rl_' . md5($ip);
$now = time();
$recent = is_readable($throttleFile)
    ? array_filter(
        array_map('intval', explode(',', (string) file_get_contents($throttleFile))),
        static fn (int $t): bool => $t > $now - 3600
    )
    : [];

if (count($recent) >= 5) {
    fail('Too many enquiries from this connection. Please try again later or email us directly.', 429);
}
$recent[] = $now;
@file_put_contents($throttleFile, implode(',', $recent), LOCK_EX);

// ── Read and validate ───────────────────────────────────────────────────
function field(string $key, int $max = 200): string {
    $value = trim((string) ($_POST[$key] ?? ''));
    // Strip control characters; header injection lives in CR/LF.
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? '';
    return mb_substr($value, 0, $max);
}

$MESSAGE_MAX = 2000;

$data = [
    'name'         => field('name', 120),
    'email'        => field('email', 200),
    'phone'        => field('phone', 40),
    'organisation' => field('organisation', 160),
    'segment'      => field('segment', 120),
    'city'         => field('city', 120),
    'scale'        => field('scale', 120),
    'timeline'     => field('timeline', 120),
    'message'      => field('message', $MESSAGE_MAX + 1),
];

$errors = [];

if (mb_strlen($data['name']) < 2) {
    $errors[] = 'Please enter your name.';
}
if ($data['email'] === '' || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}
if ($data['phone'] !== '' && !preg_match('/^[+\d][\d\s\-()]{7,19}$/', $data['phone'])) {
    $errors[] = 'Please enter a valid phone number.';
}
if ($data['segment'] === '') {
    $errors[] = 'Please choose the option that best describes you.';
}
$messageLength = mb_strlen($data['message']);
if ($messageLength < 10) {
    $errors[] = 'Please tell us a little about your requirement.';
} elseif ($messageLength > $MESSAGE_MAX) {
    $errors[] = 'Please keep your message under ' . $MESSAGE_MAX . ' characters.';
}

if ($errors !== []) {
    fail(implode(' ', $errors));
}

// ── Compose ─────────────────────────────────────────────────────────────
$lines = [
    'New enquiry from forestaindia.com',
    str_repeat('=', 40),
    '',
    'Name:         ' . $data['name'],
    'Organisation: ' . ($data['organisation'] ?: '—'),
    'Email:        ' . $data['email'],
    'Phone:        ' . ($data['phone'] ?: '—'),
    '',
    'Segment:      ' . $data['segment'],
    'City / site:  ' . ($data['city'] ?: '—'),
    'System:       ' . ($data['scale'] ?: '—'),
    'Timeline:     ' . ($data['timeline'] ?: '—'),
    '',
    'Message:',
    $data['message'],
    '',
    str_repeat('-', 40),
    'Received: ' . gmdate('Y-m-d H:i:s') . ' UTC',
    'IP:       ' . $ip,
];
$body = implode("\n", $lines);
$subject = 'Foresta India enquiry — ' . $data['name'] . ($data['organisation'] !== '' ? ' (' . $data['organisation'] . ')' : '');

// ── Send ────────────────────────────────────────────────────────────────
// PHPMailer if the host provides it, otherwise mail(). Hostinger routes
// mail() through its own SMTP for domains hosted on the account, so the
// fallback is a real delivery path, not a stub.
$sent = false;

$autoload = __DIR__ . '/vendor/autoload.php';
if (is_readable($autoload)) {
    require_once $autoload;
}

if (class_exists(\PHPMailer\PHPMailer\PHPMailer::class)) {
    try {
        $mailer = new \PHPMailer\PHPMailer\PHPMailer(true);
        $mailer->isSMTP();
        $mailer->Host       = $config['smtp_host'];
        $mailer->Port       = (int) $config['smtp_port'];
        $mailer->SMTPAuth   = true;
        $mailer->Username   = $config['smtp_user'];
        $mailer->Password   = $config['smtp_pass'];
        $mailer->SMTPSecure = ((int) $config['smtp_port'] === 465)
            ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
            : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mailer->CharSet    = 'UTF-8';

        $mailer->setFrom($config['smtp_user'], 'Foresta India Website');
        $mailer->addAddress($config['contact_to']);
        $mailer->addReplyTo($data['email'], $data['name']);
        $mailer->Subject = $subject;
        $mailer->Body    = $body;

        $mailer->send();
        $sent = true;
    } catch (\Throwable $e) {
        error_log('contact.php PHPMailer: ' . $e->getMessage());
    }
}

if (!$sent) {
    $headers = implode("\r\n", [
        'From: Foresta India Website <' . $config['smtp_user'] . '>',
        'Reply-To: ' . $data['email'],
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . PHP_VERSION,
    ]);
    $sent = mail($config['contact_to'], $subject, $body, $headers);
}

if (!$sent) {
    error_log('contact.php: delivery failed for ' . $data['email']);
    fail('We could not send your enquiry just now. Please email us directly at ' . $config['contact_to'] . '.', 500);
}

succeed();
