// Abstracted SMS Service
// In a real app, use Twilio, SNS, or Termii

const sendSMS = async (mobile, text) => {
    // Mocking SMS logic
    console.log(`[MOCK SMS] To: ${mobile} | Message: ${text}`);
    // Return true to simulate success
    return true;
};

module.exports = { sendSMS };
