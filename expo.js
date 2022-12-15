const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const buildMessage = (user, pushBody) => {
    if (!Expo.isExpoPushToken(user.expoPushToken)) {
        console.error(`Push token ${user.expoPushToken} is not a valid Expo push token`);
    }

    // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
    return {
        to: user.expoPushToken,
        title: pushBody.title,
        body: pushBody.body,
        sound: user.shouldSendSound ? 'default' : null,
        data: pushBody.data,
        priority: 'high'
    };
}

const sendPostNotification = async (messages) => {
    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    console.log('chunks')
    console.log(chunks)

    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            console.log(ticketChunk);
            tickets.push(...ticketChunk);
            // NOTE: If a ticket contains an error code in ticket.details.error, you
            // must handle it appropriately. The error codes are listed in the Expo
            // documentation:
            // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
        } catch (error) {
            console.error(error);
        }
    }
};

module.exports = {
    buildMessage,
    sendPostNotification,
}