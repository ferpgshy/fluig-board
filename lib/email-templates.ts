export function resetPasswordEmailTemplate({
  nome,
  resetLink,
  expiry = "1 hora",
}: {
  nome?: string
  resetLink: string
  expiry?: string
}) {
  const displayName = nome || "usuario"

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Redefinir sua senha — Fluig Board</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #f4f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
    img { border: 0; display: block; max-width: 100%; }
    a { text-decoration: none; }
    .email-wrapper { width: 100%; background-color: #f4f7fb; padding: 40px 16px; }
    .email-container { max-width: 560px; margin: 0 auto; }
    /* Header */
    .header { background: linear-gradient(135deg, #0077b6 0%, #00a8a8 100%); border-radius: 16px 16px 0 0; padding: 36px 40px 32px; text-align: center; }
    .header-logo { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 0; }
    .header-logo-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; }
    .header-logo-text { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px; }
    /* Body */
    .body { background-color: #ffffff; padding: 40px 40px 32px; }
    .greeting { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px; line-height: 1.3; }
    .text { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 16px; }
    .text-muted { font-size: 13px; color: #9ca3af; line-height: 1.5; }
    /* CTA Button */
    .cta-wrapper { text-align: center; margin: 32px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #0077b6 0%, #00a8a8 100%); color: #ffffff !important; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 10px; letter-spacing: 0.1px; }
    /* Divider */
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
    /* Link fallback */
    .link-fallback { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
    .link-fallback-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .link-fallback-url { font-size: 12px; color: #0077b6; word-break: break-all; line-height: 1.5; }
    /* Security box */
    .security-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 12px; align-items: flex-start; }
    .security-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .security-text { font-size: 13px; color: #92400e; line-height: 1.5; }
    .security-text strong { font-weight: 600; }
    /* Footer */
    .footer { background: #f8fafc; border-radius: 0 0 16px 16px; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer-text { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer-text a { color: #0077b6; }
    /* Mobile */
    @media only screen and (max-width: 600px) {
      .body, .footer { padding-left: 24px !important; padding-right: 24px !important; }
      .header { padding-left: 24px !important; padding-right: 24px !important; }
      .greeting { font-size: 20px !important; }
      .cta-button { padding: 13px 28px !important; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">

      <!-- HEADER -->
      <div class="header">
        <div class="header-logo">
          <div class="header-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M12 2a10 10 0 0 1 0 20A10 10 0 0 1 12 2"/><path d="M12 8a4 4 0 0 1 0 8"/>
            </svg>
          </div>
          <span class="header-logo-text">Fluig Board</span>
        </div>
      </div>

      <!-- BODY -->
      <div class="body">
        <p class="greeting">Redefinir sua senha</p>
        <p class="text">
          Ola, <strong>${displayName}</strong>. Recebemos uma solicitacao para redefinir a senha da sua conta no Fluig Board.
        </p>
        <p class="text">
          Clique no botao abaixo para criar uma nova senha. O link e valido por <strong>${expiry}</strong>.
        </p>

        <!-- CTA -->
        <div class="cta-wrapper">
          <a href="${resetLink}" class="cta-button" target="_blank">
            Redefinir minha senha
          </a>
        </div>

        <!-- Security warning -->
        <div class="security-box">
          <span class="security-icon">&#9888;&#65039;</span>
          <div class="security-text">
            <strong>Nao solicitou esta alteracao?</strong><br />
            Se voce nao pediu para redefinir sua senha, ignore este e-mail. Sua senha permanece a mesma e nenhuma alteracao sera feita.
          </div>
        </div>

        <hr class="divider" />

        <!-- Link fallback -->
        <div class="link-fallback">
          <p class="link-fallback-label">Se o botao nao funcionar, copie e cole este link no navegador:</p>
          <p class="link-fallback-url">${resetLink}</p>
        </div>

        <p class="text-muted">
          Este link expira em ${expiry} por razoes de seguranca. Caso precise de um novo link, acesse a pagina de recuperacao de senha novamente.
        </p>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p class="footer-text">
          Voce esta recebendo este e-mail porque uma solicitacao de recuperacao de senha foi feita para sua conta.<br />
          &copy; ${new Date().getFullYear()} Fluig Board &mdash; Gestao Comercial Inteligente<br />
          <a href="mailto:contato@fluigboard.com.br">contato@fluigboard.com.br</a>
        </p>
      </div>

    </div>
  </div>
</body>
</html>`
}

export function welcomeEmailTemplate({
  nome,
  email,
  senhaTemp,
  loginLink,
}: {
  nome: string
  email: string
  senhaTemp: string
  loginLink: string
}) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bem-vindo ao Fluig Board</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: #f4f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    a { text-decoration: none; }
    .email-wrapper { width: 100%; background-color: #f4f7fb; padding: 40px 16px; }
    .email-container { max-width: 560px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #0077b6 0%, #00a8a8 100%); border-radius: 16px 16px 0 0; padding: 36px 40px 32px; text-align: center; }
    .header-logo-text { font-size: 22px; font-weight: 700; color: #ffffff; }
    .header-tagline { font-size: 13px; color: rgba(255,255,255,0.75); margin-top: 4px; }
    .body { background-color: #ffffff; padding: 40px 40px 32px; }
    .greeting { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-bottom: 12px; }
    .text { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 16px; }
    .credentials-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 20px 24px; margin: 24px 0; }
    .credentials-label { font-size: 11px; font-weight: 700; color: #0077b6; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; }
    .credential-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e0f2fe; }
    .credential-row:last-child { border-bottom: none; padding-bottom: 0; }
    .credential-key { font-size: 13px; color: #6b7280; font-weight: 500; }
    .credential-value { font-size: 13px; color: #1a1a2e; font-weight: 600; font-family: monospace; }
    .cta-wrapper { text-align: center; margin: 32px 0 24px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #0077b6 0%, #00a8a8 100%); color: #ffffff !important; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 10px; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .text-muted { font-size: 13px; color: #9ca3af; line-height: 1.5; }
    .footer { background: #f8fafc; border-radius: 0 0 16px 16px; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer-text { font-size: 12px; color: #9ca3af; line-height: 1.7; }
    .footer-text a { color: #0077b6; }
    @media only screen and (max-width: 600px) {
      .body, .footer, .header { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header">
        <p class="header-logo-text">Fluig Board</p>
        <p class="header-tagline">Gestao Comercial Inteligente</p>
      </div>
      <div class="body">
        <p class="greeting">Seja bem-vindo, ${nome}!</p>
        <p class="text">
          Sua conta no <strong>Fluig Board</strong> foi aprovada e esta pronta para uso. Abaixo estao suas credenciais de acesso temporarias.
        </p>
        <div class="credentials-box">
          <p class="credentials-label">Suas credenciais de acesso</p>
          <div class="credential-row">
            <span class="credential-key">E-mail</span>
            <span class="credential-value">${email}</span>
          </div>
          <div class="credential-row">
            <span class="credential-key">Senha temporaria</span>
            <span class="credential-value">${senhaTemp}</span>
          </div>
        </div>
        <p class="text">
          Por seguranca, voce sera solicitado a <strong>alterar sua senha</strong> no primeiro acesso.
        </p>
        <div class="cta-wrapper">
          <a href="${loginLink}" class="cta-button" target="_blank">Acessar o Fluig Board</a>
        </div>
        <hr class="divider" />
        <p class="text-muted">
          Mantenha suas credenciais em seguranca e nao compartilhe sua senha com ninguem. Em caso de duvidas, entre em contato com o administrador.
        </p>
      </div>
      <div class="footer">
        <p class="footer-text">
          &copy; ${new Date().getFullYear()} Fluig Board &mdash; Gestao Comercial Inteligente<br />
          <a href="mailto:contato@fluigboard.com.br">contato@fluigboard.com.br</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`
}
