import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AppMailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Sends ticket email with QR codes both embedded in HTML and attached as PNG files
   * @param to Customer's email
   * @param name Customer's name
   * @param attachments PNG files for each ticket
   * @param context Data passed to the email template
   */
  async sendTicketEmail(
    to: string,
    name: string,
    attachments: { filename: string; content: Buffer; contentType: string }[],
    context: { name: string; tickets: any[]; year: number },
  ) {
    await this.mailerService.sendMail({
      to,
      subject: 'Your Event Tickets 🎟',
      template: '../views/ticket', // views/ticket.hbs
      context: {
        name,
        tickets: context.tickets.map((t) => ({
          eventName: t.eventName,
          code: t.code,
          qrImage: `data:image/png;base64,${t.qrBase64}`, // for inline display
        })),
        year: context.year,
      },
      attachments,
    });
  }
}
