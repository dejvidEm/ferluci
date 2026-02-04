import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

// Simple HTML escape function for security
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      message,
      contactMethod,
      date,
      vehicle,
      loanData,
    } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Meno, email a správa sú povinné polia' },
        { status: 400 }
      )
    }

    // Build email content with modern, minimalistic design
    const logoUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
      : 'https://www.ferlucicars.eu/logo.png'
    
    let emailContent = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nová správa z kontaktného formulára</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #121212; color: #E8E3D3;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #121212;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #1a1a1a; border-radius: 20px; overflow: hidden;">
              <!-- Logo Header -->
              <tr>
                <td align="center" style="padding: 40px 20px 30px; background: linear-gradient(135deg, #1a1a1a 0%, #2a0f1a 100%);">
                  <img src="${logoUrl}" alt="Ferluci Cars" style="max-width: 200px; height: auto; filter: brightness(0) invert(1);" />
                </td>
              </tr>
              
              <!-- Title -->
              <tr>
                <td align="center" style="padding: 0 40px 30px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #E8E3D3; letter-spacing: -0.5px;">Nová správa z kontaktného formulára</h1>
                </td>
              </tr>
              
              <!-- Contact Information Section -->
              <tr>
                <td style="padding: 0 40px 30px;">
                  <div style="background-color: #2a0f1a; border-radius: 12px; padding: 24px; border-left: 4px solid #E85D5D;">
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #E85D5D; text-transform: uppercase; letter-spacing: 1px;">Kontaktné informácie</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #B8B3A3; font-size: 14px; width: 140px;">Meno:</td>
                        <td style="padding: 8px 0; color: #E8E3D3; font-size: 14px; font-weight: 500;">${escapeHtml(name)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #B8B3A3; font-size: 14px;">Email:</td>
                        <td style="padding: 8px 0; color: #E8E3D3; font-size: 14px; font-weight: 500;">${escapeHtml(email)}</td>
                      </tr>
                      ${phone ? `
                      <tr>
                        <td style="padding: 8px 0; color: #B8B3A3; font-size: 14px;">Telefón:</td>
                        <td style="padding: 8px 0; color: #E8E3D3; font-size: 14px; font-weight: 500;">${escapeHtml(phone)}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #B8B3A3; font-size: 14px;">Spôsob kontaktu:</td>
                        <td style="padding: 8px 0; color: #E8E3D3; font-size: 14px; font-weight: 500;">${contactMethod === 'email' ? 'Email' : contactMethod === 'phone' ? 'Telefón' : 'SMS'}</td>
                      </tr>
                      ${date ? `
                      <tr>
                        <td style="padding: 8px 0; color: #B8B3A3; font-size: 14px;">Preferovaný dátum:</td>
                        <td style="padding: 8px 0; color: #E8E3D3; font-size: 14px; font-weight: 500;">${new Date(date).toLocaleDateString('sk-SK', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                </td>
              </tr>
    `

    if (vehicle) {
      emailContent += `
              <!-- Vehicle Section -->
              <tr>
                <td style="padding: 0 40px 30px;">
                  <div style="background-color: #2a0f1a; border-radius: 12px; padding: 24px; border-left: 4px solid #E85D5D;">
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #E85D5D; text-transform: uppercase; letter-spacing: 1px;">Vybrané vozidlo</h2>
                    <p style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #E8E3D3;">${escapeHtml(vehicle.fullName || `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}</p>
                    ${vehicle.price ? `<p style="margin: 0; font-size: 16px; color: #B8B3A3;">Cena: <span style="color: #E85D5D; font-weight: 600;">${vehicle.price.toLocaleString('sk-SK')} €</span></p>` : ''}
                  </div>
                </td>
              </tr>
      `
    }

    if (loanData) {
      emailContent += `
              <!-- Loan Data Section -->
              <tr>
                <td style="padding: 0 40px 30px;">
                  <div style="background-color: #2a0f1a; border-radius: 12px; padding: 24px; border-left: 4px solid #E85D5D;">
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #E85D5D; text-transform: uppercase; letter-spacing: 1px;">Financovanie</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #B8B3A3; font-size: 14px; width: 180px;">Akontácia:</td>
                        <td style="padding: 8px 0; color: #E8E3D3; font-size: 14px; font-weight: 500;">${loanData.downPayment}%</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #B8B3A3; font-size: 14px;">Dĺžka financovania:</td>
                        <td style="padding: 8px 0; color: #E8E3D3; font-size: 14px; font-weight: 500;">${loanData.financingYears} ${loanData.financingYears === 1 ? 'rok' : loanData.financingYears < 5 ? 'roky' : 'rokov'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #B8B3A3; font-size: 14px;">Výška úveru:</td>
                        <td style="padding: 8px 0; color: #E8E3D3; font-size: 14px; font-weight: 500;">${loanData.loanAmount.toLocaleString('sk-SK')} €</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #B8B3A3; font-size: 14px;">Mesačná splátka:</td>
                        <td style="padding: 8px 0; color: #E85D5D; font-size: 16px; font-weight: 700;">${loanData.monthlyPayment.toLocaleString('sk-SK')} €</td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
      `
    }

    emailContent += `
              <!-- Message Section -->
              <tr>
                <td style="padding: 0 40px 40px;">
                  <div style="background-color: #2a0f1a; border-radius: 12px; padding: 24px; border-left: 4px solid #E85D5D;">
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #E85D5D; text-transform: uppercase; letter-spacing: 1px;">Správa</h2>
                    <div style="background-color: #1a1a1a; border-radius: 8px; padding: 20px; color: #E8E3D3; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 30px 40px; background-color: #121212; border-top: 1px solid #2a0f1a;">
                  <p style="margin: 0; color: #B8B3A3; font-size: 12px; line-height: 1.5;">
                    Táto správa bola odoslaná z kontaktného formulára na<br>
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ferlucicars.eu'}" style="color: #E85D5D; text-decoration: none; font-weight: 500;">www.ferlucicars.eu</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: process.env.CONTACT_EMAIL || 'contact@ferlucicars.eu',
      replyTo: email,
      subject: vehicle
        ? `Nová správa - ${escapeHtml(vehicle.fullName || `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}`
        : 'Nová správa z kontaktného formulára',
      html: emailContent,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Chyba pri odosielaní emailu' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Správa bola úspešne odoslaná', id: data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Chyba pri spracovaní požiadavky' },
      { status: 500 }
    )
  }
}
