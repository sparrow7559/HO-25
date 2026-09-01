import nodemailer from "nodemailer";

export const contactUs = async (req, res) => {
  try {
    const { fullName, email, title, message } = req.body;

    if (!fullName || !email || !title || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER, // your own email (sender)
      to: process.env.EMAIL_TO,     // your own email (receiver)
      subject: `Contact Form: ${title}`,
      text: `You have a new contact form submission:

Full Name: ${fullName}
Email: ${email}
Title: ${title}
Message: ${message}`,
    };

    // Send mail
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    // console.error(err);
    res
      .status(500)
      .json({ message: "Failed to send message", error: err.message });
  }
};
