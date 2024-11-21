import { englishStripped } from '../../localizer/i18n/localizedString';
import { androidIt, iosIt } from '../../types/sessionIt';
import { USERNAME } from '../../types/testing';
import { EndCallButton } from './locators/calls';
import { newUser } from './utils/create_account';
import { sleepFor } from './utils/index';
import { SupportedPlatformsType, closeApp, openAppTwoDevices } from './utils/open_app';

androidIt('Voice calls', 'high', voiceCall);
iosIt('Voice calls', 'high', voiceCall);

async function voiceCall(platform: SupportedPlatformsType) {
  // Open app
  const { device1, device2 } = await openAppTwoDevices(platform);
  // Create user A and User B
  const [userA, userB] = await Promise.all([
    newUser(device1, USERNAME.ALICE, platform),
    newUser(device2, USERNAME.BOB, platform),
  ]);
  await device1.sendNewMessage(userB, 'Testing calls');
  // Look for phone icon (shouldnt be there)
  await device1.hasElementBeenDeleted({
    strategy: 'accessibility id',
    selector: 'Call',
  });
  // Create contact
  await device2.clickOnByAccessibilityID('Message requests banner');
  // Select message from User A
  await device2.clickOnByAccessibilityID('Message request');
  await device2.onAndroid().clickOnByAccessibilityID('Accept message request');
  // Type into message input box
  await device2.sendMessage(`Reply-message-${userB.userName}-to-${userA.userName}`);
  // Verify config message states message request was accepted
  // "messageRequestsAccepted": "Your message request has been accepted.",
  const messageRequestsAccepted = englishStripped('messageRequestsAccepted')
    .withArgs({ name: userA.userName })
    .toString();
  await device1.waitForControlMessageToBePresent(messageRequestsAccepted, 8000);
  // Phone icon should appear now that conversation has been approved
  await device1.enableVoiceCalls();
  await device1.clickOnByAccessibilityID('Call');
  // Wait 10 seconds
  await sleepFor(10000);
  // Hang up
  await device1.clickOnElementAll(new EndCallButton(device1));
  // Missed call dialog should pop telling User B to enable calls
  // await device2
  //   .onIOS()
  //   .checkModalStrings(
  //     englishStripped(`callsMissedCallFrom`).withArgs({ name: userA.userName }).toString(),
  //     englishStripped(`callsYouMissedCallPermissions`).withArgs({ name: userA.userName }).toString()
  //   );
  await device2.onIOS().clickOnElementAll({
    strategy: 'id',
    selector: 'Okay',
  });
  const missedCall = englishStripped(`callsMissedCallFrom`)
    .withArgs({ name: userA.userName })
    .toString();
  await device2.onAndroid().waitForTextElementToBePresent({
    strategy: 'id',
    selector: 'network.loki.messenger:id/call_text_view',
    text: missedCall,
  });
  await device2.onIOS().waitForTextElementToBePresent({
    strategy: 'accessibility id',
    selector: 'Control message',
    text: missedCall,
  });
  // Need to navigate out of conversation for user to have full contact actions (calls icon, etc)
  await device2.navigateBack();
  await device2.clickOnElementAll({
    strategy: 'accessibility id',
    selector: 'Conversation list item',
    text: userA.userName,
  });
  // Enable voice calls on device 2 for User B
  await device2.enableVoiceCalls();
  // Make call on device 1 (userA)
  await device1.clickOnByAccessibilityID('Call');
  // Wait for call to come through
  // Answer call on device 2
  await device2.clickOnByAccessibilityID('Answer call');
  // Have to press answer twice, once in drop down and once in full screen
  await sleepFor(500);
  await device2.clickOnByAccessibilityID('Answer call');
  // Wait 10 seconds
  await sleepFor(1000);
  // Hang up
  await device1.clickOnElementAll(new EndCallButton(device1));
  // Check for control messages on both devices
  // "callsYouCalled": "You called {name}",
  const callsYouCalled = englishStripped('callsYouCalled')
    .withArgs({ name: userB.userName })
    .toString();
  // callsCalledYou: '{name} called you',
  const callsCalledYou = englishStripped('callsCalledYou')
    .withArgs({ name: userB.userName })
    .toString();
  await device1.waitForControlMessageToBePresent(callsYouCalled);
  await device2.waitForControlMessageToBePresent(callsCalledYou);
  // Excellent
  await closeApp(device1, device2);
}
