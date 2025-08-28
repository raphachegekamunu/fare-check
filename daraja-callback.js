const { connectToDB } = require("./_db");

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

    let receiptDoc = {
      status: "FAILED",
      message: resultDesc,
      createdAt: new Date(),
    };

    if (resultCode === 0) {
      const callbackItems = stkCallback.CallbackMetadata?.Item || [];

      const amount = callbackItems.find(i => i.Name === "Amount")?.Value;
      const mpesaReceipt = callbackItems.find(i => i.Name === "MpesaReceiptNumber")?.Value;
      const phoneNumber = callbackItems.find(i => i.Name === "PhoneNumber")?.Value;
      const transactionDate = callbackItems.find(i => i.Name === "TransactionDate")?.Value;

      const receiptCode = "RC" + Math.floor(100000 + Math.random() * 900000);

      receiptDoc = {
        status: "SUCCESS",
        mpesaReceipt,
        receiptCode,
        amount,
        phoneNumber,
        transactionDate,
        createdAt: new Date(),
      };
    }

    // 📦 Save to MongoDB
    const db = await connectToDB();
    await db.collection("payments").insertOne(receiptDoc);

    console.log("✅ Payment saved:", receiptDoc);

    res.json({ ResultCode: 0, ResultDesc: "Callback received successfully" });
  } catch (error) {
    console.error("❌ Callback processing error:", error);
    res.status(500).send("Server error");
  }
};
