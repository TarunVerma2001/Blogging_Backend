const sgMail = require('@sendgrid/mail');

class Email {
  constructor(user, message) {
    this.to = user.email;
    this.name = user.name;
    this.from =  `${process.env.EMAIL_FROM}`;;
    this.message = message;
  }
  async send(subject) {
    //Preparing email options
    sgMail.setApiKey(process.nextTick.SENDGRID_API_KEY);

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text: this.message,
      html: `<strong>${this.message}</strong>`,
    };

    // creating transporter and sending email using sgMail
    sgMail
      .send(mailOptions)
      .then(() => {
        console.log('Email Sent');
      })
      .catch((err) => {
        console.log('Error in sending mail', err);
      });
  }
  async sendPasswordResetMessage() {
    await this.send('Your Password Reset Token is valid for next 10 minutes');
  }
  async sendWelcomeMessage() {
    await this.send('Welcome to the Blogging world!');
  }
}

module.exports = Email;
