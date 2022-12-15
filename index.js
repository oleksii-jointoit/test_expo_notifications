const express = require('express')
const app = express()
const port = 3000
const { buildMessage, sendPostNotification } = require('./expo');
const multer = require('multer');
const upload = multer();

app.use(express.json());

// fake db
let messages = [];
const user = {
  expoPushToken: null,
  shouldSendNotifications: true,
  shouldSendSound: true,
}

/*
example:
post: http://localhost:3000/save
{
    "expoPushToken": "<YOUR_PUSH_TOKEN_HERE>",
    "shouldSendNotifications": true,
    "shouldSendSound": true
}
*/
app.post('/save', upload.any(), (req, res) => {
  console.log('saving user data');
  const body = req.body;

  const expoPushToken = body.expoPushToken;
  if (expoPushToken !== undefined) {
    user.expoPushToken = expoPushToken;
  }
  const shouldSendNotifications = body.shouldSendNotifications;
  if (shouldSendNotifications !== undefined) {
    user.shouldSendNotifications = shouldSendNotifications;
  }
  const shouldSendSound = body.shouldSendSound;
  if (shouldSendSound !== undefined) {
    user.shouldSendSound = shouldSendSound;
  }
  console.log('user updated to:', user)
  res.sendStatus(200);
})

/*
example:
post http://localhost:3000/send
{
    "title": "New invoice",
    "body": "You have new invoice",
    "data": { "invoiceId": "<SOME_INVOICE_ID>" }
}
or
{
  "title": "New order",
  "body": "You have new order, check it out!",
  "data": { orderId: "<SOME_ORDER_ID>" }
}
*/
app.post('/send', (req, res) => {
  console.log('sending push to user: ', user);
  const pushBody = req.body;
  console.log('push body: ', pushBody);

  messages.push(buildMessage(user, pushBody));
  if (user.shouldSendNotifications && user.expoPushToken) {
    console.log('messages: ', messages);
    sendPostNotification(messages);
  } else {
    console.log('user disabled notifications or doesn\'t have push token');
  }
  messages = [];
  res.sendStatus(200);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
