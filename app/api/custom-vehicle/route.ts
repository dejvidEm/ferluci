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
    const { brand, model, budget, contact } = body

    // Validate required fields
    if (!brand || !model || !budget || !contact) {
      return NextResponse.json(
        { error: 'Všetky polia sú povinné' },
        { status: 400 }
      )
    }

    // Build email content with modern, minimalistic design
    const logoUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
      : 'https://www.ferlucicars.eu/logo.png'
    
    const emailContent = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nový dopyt na auto na mieru</title>
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
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #E8E3D3; letter-spacing: -0.5px;">Nový dopyt na auto na mieru</h1>
                  <p style="margin: 12px 0 0 0; font-size: 14px; color: #B8B3A3;">Formulár: Nemáme auto ktoré hľadáte?</p>
                </td>
              </tr>
              
              <!-- Vehicle Request Section -->
              <tr>
                <td style="padding: 0 40px 40px;">
                  <div style="background-color: #2a0f1a; border-radius: 12px; padding: 24px; border-left: 4px solid #E85D5D;">
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #E85D5D; text-transform: uppercase; letter-spacing: 1px;">Požiadavky na vozidlo</h2>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 12px 0; color: #B8B3A3; font-size: 14px; width: 140px; border-bottom: 1px solid #1a1a1a;">Značka:</td>
                        <td style="padding: 12px 0; color: #E8E3D3; font-size: 16px; font-weight: 600; border-bottom: 1px solid #1a1a1a;">${escapeHtml(brand)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #B8B3A3; font-size: 14px; border-bottom: 1px solid #1a1a1a;">Model:</td>
                        <td style="padding: 12px 0; color: #E8E3D3; font-size: 16px; font-weight: 600; border-bottom: 1px solid #1a1a1a;">${escapeHtml(model)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #B8B3A3; font-size: 14px; border-bottom: 1px solid #1a1a1a;">Rozpočet:</td>
                        <td style="padding: 12px 0; color: #E85D5D; font-size: 18px; font-weight: 700; border-bottom: 1px solid #1a1a1a;">${escapeHtml(budget)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; color: #B8B3A3; font-size: 14px;">Kontakt:</td>
                        <td style="padding: 12px 0; color: #E8E3D3; font-size: 16px; font-weight: 500;">${escapeHtml(contact)}</td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 30px 40px; background-color: #121212; border-top: 1px solid #2a0f1a;">
                  <p style="margin: 0; color: #B8B3A3; font-size: 12px; line-height: 1.5;">
                    Tento dopyt bol odoslaný z formulára na<br>
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
      replyTo: contact.includes('@') ? contact : undefined,
      subject: `Dopyt na auto na mieru - ${escapeHtml(brand)} ${escapeHtml(model)}`,
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
      { message: 'Dopyt bol úspešne odoslaný', id: data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Custom vehicle form error:', error)
    return NextResponse.json(
      { error: 'Chyba pri spracovaní požiadavky' },
      { status: 500 }
    )
  }
}
