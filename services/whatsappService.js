class WhatsAppService {
    static generateWhatsAppLink(providerNumber, message) {
        const cleanNumber = providerNumber.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    }

    static generateBookingMessage(bookingData) {
        const { customerName, serviceType, address, description, isEmergency } = bookingData;
        
        let message = `🛎️ *NEW SERVICE REQUEST* 🛎️\n\n`;
        message += `👤 *Customer:* ${customerName}\n`;
        message += `📞 *Phone:* ${bookingData.customerPhone}\n`;
        message += `🔧 *Service:* ${serviceType.toUpperCase()}\n`;
        
        if (isEmergency) message += `🚨 *EMERGENCY BOOKING* 🚨\n`;
        
        message += `\n📍 *Address:* ${address.fullAddress}\n`;
        message += `🏙️ *City:* ${address.city}\n`;
        message += `📮 *Pincode:* ${address.pincode}\n`;
        if (address.landmark) message += `🗺️ *Landmark:* ${address.landmark}\n`;
        
        message += `\n📝 *Description:* ${description}\n`;
        message += `\n---\nPlease contact the customer to confirm this booking.`;
        
        return message;
    }
}

module.exports = WhatsAppService;