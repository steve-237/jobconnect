export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export function getWelcomeEmailTemplate(firstName: string, role: string): { subject: string; html: string; text: string } {
  const isEmployer = role === 'EMPLOYER';
  const roleName = isEmployer ? 'Employeur' : 'Candidat';
  const subject = 'Bienvenue sur JobConnect ! 🚀';
  
  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 26px; font-weight: 800; color: #f59e0b; text-decoration: none; }
        .badge { display: inline-block; background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-top: 8px; }
        h1 { font-size: 22px; color: #ffffff; margin-top: 16px; }
        p { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .button { display: inline-block; background: #f59e0b; color: #000000; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; margin: 20px 0; }
        .footer { margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ JobConnect</div>
          <div class="badge">Espace ${roleName}</div>
        </div>
        <h1>Bonjour ${firstName},</h1>
        <p>Nous sommes ravis de vous accueillir sur <strong>JobConnect</strong>, la plateforme de mise en relation rapide pour missions et petits boulots avec paiement sécurisé sous séquestre.</p>
        <p>${
          isEmployer
            ? 'Vous pouvez dès maintenant publier vos annonces de missions, recevoir des candidatures qualifiées et payer en toute sécurité une fois la prestation validée.'
            : 'Vous pouvez dès maintenant parcourir les missions près de chez vous, postuler en 1 clic et développer votre réputation grâce aux évaluations.'
        }</p>
        <div style="text-align: center;">
          <a href="https://jobconnect-web.vercel.app/dashboard" class="button">Accéder à mon tableau de bord</a>
        </div>
        <p>À très bientôt sur JobConnect !</p>
        <div class="footer">
          JobConnect © ${new Date().getFullYear()} - Plateforme de missions ponctuelles & services entre particuliers et pros.
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Bonjour ${firstName},\n\nBienvenue sur JobConnect (${roleName}) !\nVotre compte est désormais prêt.\nAccédez à votre espace: https://jobconnect-web.vercel.app/dashboard\n\nÀ bientôt,\nL'équipe JobConnect`;

  return { subject, html, text };
}

export function getNewApplicationEmailTemplate(
  employerName: string,
  candidateName: string,
  jobTitle: string,
): { subject: string; html: string; text: string } {
  const subject = `Nouvelle candidature pour : "${jobTitle}" 📩`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #f59e0b; }
        h1 { font-size: 20px; color: #ffffff; margin-top: 16px; }
        p { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .job-card { background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 16px; margin: 16px 0; }
        .button { display: inline-block; background: #f59e0b; color: #000000; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px; }
        .footer { margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ JobConnect</div>
        </div>
        <h1>Bonjour ${employerName},</h1>
        <p>Bonne nouvelle ! <strong>${candidateName}</strong> vient de postuler à votre mission :</p>
        <div class="job-card">
          <strong style="color: #f59e0b; font-size: 16px;">${jobTitle}</strong>
        </div>
        <p>Rendez-vous sur votre tableau de bord pour consulter son profil, son score de matching, ses avis clients et accepter sa candidature.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://jobconnect-web.vercel.app/dashboard" class="button">Voir la candidature</a>
        </div>
        <div class="footer">
          JobConnect © ${new Date().getFullYear()} - Notifications de candidatures
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Bonjour ${employerName},\n\n${candidateName} a postulé à votre annonce "${jobTitle}".\nConsultez sa candidature sur votre dashboard : https://jobconnect-web.vercel.app/dashboard\n\nL'équipe JobConnect`;

  return { subject, html, text };
}

export function getApplicationAcceptedEmailTemplate(
  candidateName: string,
  jobTitle: string,
  price: number,
): { subject: string; html: string; text: string } {
  const subject = `Félicitations ! Votre candidature pour "${jobTitle}" a été acceptée 🎉`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #10b981; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #10b981; }
        h1 { font-size: 20px; color: #ffffff; }
        p { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
        .highlight { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin: 16px 0; }
        .button { display: inline-block; background: #10b981; color: #ffffff; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px; }
        .footer { margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ JobConnect</div>
        </div>
        <h1>Bravo ${candidateName} !</h1>
        <p>L'employeur a retenu votre profil pour la mission suivante :</p>
        <div class="highlight">
          <h3 style="margin: 0 0 8px 0; color: #ffffff;">${jobTitle}</h3>
          <p style="margin: 0; color: #10b981; font-weight: 700; font-size: 16px;">Rémunération garantie : ${price} €</p>
        </div>
        <p>Les fonds sont sécurisés sous séquestre. Vous pouvez désormais échanger en messagerie directe avec l'employeur pour organiser la prestation.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="https://jobconnect-web.vercel.app/dashboard" class="button">Ouvrir la messagerie</a>
        </div>
        <div class="footer">
          JobConnect © ${new Date().getFullYear()} - Missions en direct
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Bonjour ${candidateName},\n\nVotre candidature pour "${jobTitle}" a été acceptée !\nRémunération : ${price} € sous séquestre sécurisé.\nAccédez à la mission : https://jobconnect-web.vercel.app/dashboard\n\nL'équipe JobConnect`;

  return { subject, html, text };
}

export function getPaymentReceiptEmailTemplate(
  userName: string,
  jobTitle: string,
  amount: number,
  transactionId: string,
): { subject: string; html: string; text: string } {
  const subject = `Reçu de paiement sécurisé JobConnect - ${amount} € 🧾`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #f59e0b; }
        h1 { font-size: 20px; color: #ffffff; }
        p { font-size: 14px; line-height: 1.6; color: #cbd5e1; }
        .receipt-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden; }
        .receipt-table td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 14px; }
        .receipt-table tr:last-child td { border-bottom: none; font-weight: bold; font-size: 16px; color: #f59e0b; }
        .footer { margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">⚡ JobConnect</div>
        </div>
        <h1>Reçu de transaction</h1>
        <p>Bonjour ${userName}, voici le récapitulatif de votre paiement sous séquestre :</p>
        <table class="receipt-table">
          <tr>
            <td>Mission</td>
            <td style="text-align: right; color: #ffffff;">${jobTitle}</td>
          </tr>
          <tr>
            <td>Identifiant de transaction</td>
            <td style="text-align: right; font-family: monospace; color: #94a3b8;">${transactionId}</td>
          </tr>
          <tr>
            <td>Statut des fonds</td>
            <td style="text-align: right; color: #10b981;">Séquestre Garanti 🛡️</td>
          </tr>
          <tr>
            <td>Montant Total</td>
            <td style="text-align: right;">${amount.toFixed(2)} €</td>
          </tr>
        </table>
        <p style="font-size: 12px; color: #94a3b8;">Les fonds sont conservés en toute sécurité jusqu'à la confirmation de fin de mission par l'employeur.</p>
        <div class="footer">
          JobConnect © ${new Date().getFullYear()} - Service Comptabilité & Séquestre
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Reçu de paiement JobConnect\n\nBonjour ${userName},\nMission : ${jobTitle}\nMontant : ${amount} €\nTransaction : ${transactionId}\nFonds sous séquestre garanti.\n\nL'équipe JobConnect`;

  return { subject, html, text };
}
