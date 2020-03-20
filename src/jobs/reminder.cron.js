const { CRON_CONFIG, EMAIL_CONFIG } = require("../constants/index.constants");

const cron = require("node-cron");
const nodemailer = require("nodemailer");
const prescriptionModel = require("../models/prescription.model");
const moment = require('moment');

const remindOnce = cron.schedule(
  "0 0 7 * * *",
  () => {
    remind(1);
  },
  CRON_CONFIG
);

const remindTwice = cron.schedule(
  "* */12 * * *",
  () => {
    remind(2);
  },
  CRON_CONFIG
);

const remindThrice = cron.schedule(
  "* */8 * * *",
  () => {
    remind(3);
  },
  CRON_CONFIG
);

const remindFour = cron.schedule(
  "* */6 * * *",
  () => {
    remind(4);
  },
  CRON_CONFIG
);

function remind(interval) {
  prescriptionModel.find(
    {
      expectedDateEnd: { $gte: moment().subtract(1, 'day') },
      filled: false,
      verified: true,
      interval
    },
    (err, prescriptions) => {
      if (err) console.log(err);
      // no reminders to be sent, exit
      if (!prescriptions.length) return;
      prescriptions.forEach(async prescription => {
        const {
          patientEmail,
          prescriberEmail,
          quantity,
          unit,
          patientName,
          furtherAdvice,
          prescriberName,
          prescription: medicine
        } = prescription;

        let body = `<p>Hi, ${patientName}, please remember to take your prescriptions</p>
        <p>Prescription: Take ${quantity} ${unit} of ${medicine}</p>
        <p>Contact ${prescriberName} on <a href="mailto:${prescriberEmail}">email</a> for further assistance</p>`;

        furtherAdvice ? (body += `<p>Advice: ${furtherAdvice}</p>`) : null;

        const transporter = nodemailer.createTransport(EMAIL_CONFIG);

        try {
          await transporter.sendMail({
            from: '"Prescryber " <reminder@prescryber.com>',
            to: `${patientEmail}`,
            subject: "Prescription reminder",
            html: `${body}`
          });
        } catch (error) {
          console.log(error);
        }
      });
    }
  );
}

remindOnce.start();
remindTwice.start();
remindThrice.start();
remindFour.start();

module.exports = { remindOnce, remindThrice, remindTwice, remindFour };
