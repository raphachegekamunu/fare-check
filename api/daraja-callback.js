module.exports = async (req, res) => {
  try {
    console.log("📩 Daraja Callback Received:", JSON.stringify(req.body, null, 2));

    if (!req.body || !req.body.Body) {
      console.error("❌ Callback error: Invalid data received");
      return res.status(400).send("Invalid callback data");
    }

    const stkCallback = req.body.Body.stkCallback;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Default response
    let message = `Payment failed: ${resultDesc}`;
    let receiptCode = null;

    if (resultCode === 0) {
      // ✅ Successful transaction
      const callbackItems = stkCallback.CallbackMetadata?.Item || [];

      const amount = callbackItems.find(i => i.Name === "Amount")?.Value;
      const mpesaReceipt = callbackItems.find(i => i.Name === "MpesaReceiptNumber")?.Value;
      const phoneNumber = callbackItems.find(i => i.Name === "PhoneNumber")?.Value;
      const transactionDate = callbackItems.find(i => i.Name === "TransactionDate")?.Value;

      // 🎟️ Generate unique receipt code for conductor verification
      receiptCode = "RC" + Math.floor(100000 + Math.random() * 900000);

      message = `✅ Payment Successful!\nReceipt: ${mpesaReceipt}\nCode: ${receiptCode}\nAmount: ${amount}\nPhone: ${phoneNumber}\nDate: ${transactionDate}`;
    }

    // Log final message (later you’ll store in DB instead of just logging)
    console.log("📦 Finalized Payment:", message);

    // ✅ Always respond 200 to Safaricom
    res.json({ ResultCode: 0, ResultDesc: "Callback received successfully" });
  } catch (error) {
    console.error("❌ Callback processing error:", error);
    res.status(500).send("Server error");
  }
};
