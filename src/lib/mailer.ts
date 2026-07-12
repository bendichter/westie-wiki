import "server-only";

/**
 * Minimal outbound email. Uses Resend's HTTPS API when RESEND_API_KEY is set
 * (no SDK needed); otherwise logs the message to the server console so local
 * development and un-configured deployments still surface reset links.
 */
export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ delivered: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? "Westie Wiki <noreply@westie.wiki>";

  if (!apiKey) {
    console.log(`[mailer] RESEND_API_KEY not set — email not sent.\nTo: ${to}\nSubject: ${subject}\n${text}`);
    return { delivered: false };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error(`[mailer] Resend responded ${res.status}: ${await res.text()}`);
      return { delivered: false };
    }
    return { delivered: true };
  } catch (err) {
    console.error("[mailer] send failed:", err);
    return { delivered: false };
  }
}
