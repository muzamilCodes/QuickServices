exports.generateWhatsAppLink = ({
  phone,
  name,
  service,
  address,
  description,
}) => {
  const message = `Hello, my name is ${name}.
I need ${service}.
Address: ${address}.
Problem: ${description}`;

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${phone}?text=${encodedMessage}`;
};