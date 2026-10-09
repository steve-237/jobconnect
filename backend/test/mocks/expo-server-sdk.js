class Expo {
  static isExpoPushToken(token) {
    return typeof token === 'string' && token.startsWith('ExponentPushToken');
  }
  async sendPushNotificationsAsync(messages) {
    return [{ status: 'ok' }];
  }
}

module.exports = Expo;
module.exports.default = Expo;
module.exports.Expo = Expo;
