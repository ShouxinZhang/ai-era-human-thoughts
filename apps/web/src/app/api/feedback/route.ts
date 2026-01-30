import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const FEEDBACK_TO = process.env.FEEDBACK_TO || '3304724172@qq.com';
const FEEDBACK_SUBJECT = process.env.FEEDBACK_SUBJECT || 'AI Era Human Thoughts - Feedback';
const DRY_RUN = String(process.env.FEEDBACK_DRY_RUN || '').toLowerCase() === 'true';

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function getTransport() {
  const host = requireEnv('SMTP_HOST');
  const port = Number(process.env.SMTP_PORT || '465');
  const user = requireEnv('SMTP_USER');
  const pass = requireEnv('SMTP_PASS');
  const secure = String(process.env.SMTP_SECURE || (port === 465 ? 'true' : 'false')).toLowerCase() === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.message || '').trim();
    const contact = String(body?.contact || '').trim();

    if (!message) {
      return new NextResponse('Message is required', { status: 400 });
    }

    if (message.length > 4000) {
      return new NextResponse('Message too long', { status: 400 });
    }

    const ua = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '';

    const lines = [
      '反馈内容：',
      message,
      '',
      contact ? `联系方式：${contact}` : null,
      referer ? `来源页面：${referer}` : null,
      ip ? `IP：${ip}` : null,
      ua ? `UA：${ua}` : null,
      `时间：${new Date().toISOString()}`,
    ].filter(Boolean);

    const text = lines.join('\n');

    const effectiveDryRun = DRY_RUN || (process.env.NODE_ENV === 'development' && !hasSmtpConfig());

    if (effectiveDryRun) {
      console.log('[feedback][dry-run] to=%s subject=%s\n%s', FEEDBACK_TO, FEEDBACK_SUBJECT, text);
      return NextResponse.json({ ok: true, dryRun: true });
    }

    const transporter = getTransport();
    const from = process.env.FEEDBACK_FROM || process.env.SMTP_USER || FEEDBACK_TO;

    await transporter.sendMail({
      from,
      to: FEEDBACK_TO,
      subject: FEEDBACK_SUBJECT,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = (error as Error).message || 'Unknown error';
    return new NextResponse(message, { status: 500 });
  }
}
