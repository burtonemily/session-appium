import { XPATHS } from "../../constants";
import { androidIt } from "../../types/sessionIt";
import { sleepFor } from "./utils";
import { newUser } from "./utils/create_account";
import { newContact } from "./utils/create_contact";
import { joinCommunity } from "./utils/join_community";
import { linkedDevice } from "./utils/link_device";

import {
  closeApp,
  openAppThreeDevices,
  openAppTwoDevices,
  SupportedPlatformsType,
} from "./utils/open_app";
import { runScriptAndLog } from "./utils/utilities";

async function sendImage(platform: SupportedPlatformsType) {
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create user with linked device
  const userA = await linkedDevice(device1, device3, "Alice", platform);
  // Create user B
  const userB = await newUser(device2, "Bob", platform);
  const testMessage = "Sending image from Alice to Bob";
  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  await device3.clickOnElementAll({
    strategy: "accessibility id",
    selector: "Conversation list item",
    text: userB.userName,
  });
  // Send test image to bob from Alice (device 1)
  await device1.sendImageWithMessageAndroid(testMessage);
  // Trust message on device 2 (bob)
  await device2.clickOnByAccessibilityID("Untrusted attachment message");
  // User B - Click on 'download'
  await device2.clickOnByAccessibilityID("Download media", 5000);
  // Wait for image to load (unclickable if not loaded correctly)
  // Check device 2 and linked device (device 3) for image
  await Promise.all([
    device2.waitForTextElementToBePresent({
      strategy: "accessibility id",
      selector: "Message body",
      text: testMessage,
    }),
    device3.waitForTextElementToBePresent({
      strategy: "accessibility id",
      selector: "Message body",
      text: testMessage,
    }),
  ]);
  // Reply to message (on device 2 - Bob)
  const replyMessage = await device2.replyToMessage(userA, testMessage);
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });

  // Close app and server
  await closeApp(device1, device2, device3);
}
// TO FIX (DOCUMENT BUTTON NOT FOUND)
async function sendDocument(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);

  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  const replyMessage = `Replying to document from ${userA.userName}`;
  await newContact(platform, device1, userA, device2, userB);
  await device1.sendDocument(platform);
  await device2.clickOnByAccessibilityID("Untrusted attachment message", 7000);
  await sleepFor(500);
  // User B - Click on 'download'
  await device2.clickOnByAccessibilityID("Download media");
  // Reply to message
  // await sleepFor(5000);
  await device2.longPress("Document");
  await device2.clickOnByAccessibilityID("Reply to message");
  await device2.sendMessage(replyMessage);
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  // Close app and server
  await closeApp(device1, device2);
}

async function sendVideo(platform: SupportedPlatformsType) {
  // Test sending a video
  // open devices
  const { device1, device2 } = await openAppTwoDevices(platform);
  // create user a and user b
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  const replyMessage = `Replying to video from ${userA.userName}`;
  // create contact
  await newContact(platform, device1, userA, device2, userB);
  // Send video
  await device1.sendVideo(platform);
  // User B - Click on untrusted attachment message
  await device2.clickOnElementAll({
    strategy: "accessibility id",
    selector: "Untrusted attachment message",
    maxWait: 10000,
  });
  // User B - Click on 'download'
  await device2.clickOnElementAll({
    strategy: "accessibility id",
    selector: "Download media",
  });
  // Reply to message
  await device2.waitForTextElementToBePresent({
    strategy: "id",
    selector: "network.loki.messenger:id/play_overlay",
  });
  await device2.longPress("Media message");
  await device2.clickOnByAccessibilityID("Reply to message");
  await device2.sendMessage(replyMessage);
  await sleepFor(2000);
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });

  // Close app and server
  await closeApp(device1, device2);
}

async function sendVoiceMessage(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);
  // create user a and user b
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  const replyMessage = `Replying to voice message from ${userA.userName}`;
  await newContact(platform, device1, userA, device2, userB);
  // Select voice message button to activate recording state
  await device1.longPress("New voice message");

  await device1.clickOnByAccessibilityID("Continue");
  await device1.clickOnElementXPath(XPATHS.VOICE_TOGGLE);
  await device1.pressAndHold("New voice message");
  // await device1.waitForTextElementToBePresent("Voice message");
  await device2.clickOnByAccessibilityID("Untrusted attachment message");
  await sleepFor(200);
  await device2.clickOnByAccessibilityID("Download media");
  await sleepFor(1500);
  await device2.longPress("Voice message");
  await device2.clickOnByAccessibilityID("Reply to message");
  await device2.sendMessage(replyMessage);
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  await closeApp(device1, device2);
}

async function sendGif(platform: SupportedPlatformsType) {
  // Test sending a video
  // open devices and server
  const { device1, device2 } = await openAppTwoDevices(platform);
  // create user a and user b
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  const replyMessage = `Replying to GIF from ${userA.userName}`;
  // create contact
  await newContact(platform, device1, userA, device2, userB);
  // Click on attachments button
  await device1.clickOnByAccessibilityID("Attachments button");
  // Select GIF tab

  await device1.clickOnByAccessibilityID("GIF button");
  await device1.clickOnElementAll({
    strategy: "accessibility id",
    selector: "Continue",
  });

  // Select gif
  await sleepFor(3000);
  await device1.clickOnElementXPath(XPATHS.FIRST_GIF);

  // Check if the 'Tap to download media' config appears
  // Click on config
  await device2.clickOnByAccessibilityID("Untrusted attachment message", 9000);
  await sleepFor(500);
  // Click on 'download'
  await device2.clickOnByAccessibilityID("Download media");
  // Reply to message
  await sleepFor(5000);
  await device2.longPress("Media message");
  // Check reply came through on device1
  await device2.clickOnByAccessibilityID("Reply to message");
  await device2.sendMessage(replyMessage);
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });

  // Close app
  await closeApp(device1, device2);
}

async function sendLongMessage(platform: SupportedPlatformsType) {
  const longText =
    "Mauris sapien dui, sagittis et fringilla eget, tincidunt vel mauris. Mauris bibendum quis ipsum ac pulvinar. Integer semper elit vitae placerat efficitur. Quisque blandit scelerisque orci, a fringilla dui. In a sollicitudin tortor. Vivamus consequat sollicitudin felis, nec pretium dolor bibendum sit amet. Integer non congue risus, id imperdiet diam. Proin elementum enim at felis commodo semper. Pellentesque magna magna, laoreet nec hendrerit in, suscipit sit amet risus. Nulla et imperdiet massa. Donec commodo felis quis arcu dignissim lobortis. Praesent nec fringilla felis, ut pharetra sapien. Donec ac dignissim nisi, non lobortis justo. Nulla congue velit nec sodales bibendum. Nullam feugiat, mauris ac consequat posuere, eros sem dignissim nulla, ac convallis dolor sem rhoncus dolor. Cras ut luctus risus, quis viverra mauris.";
  // Sending a long text message
  // Open device and server
  const { device1, device2 } = await openAppTwoDevices(platform);
  // Create user A and User B
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  // Send a long message from User A to User B
  await device1.sendMessage(longText);
  // Reply to message (User B to User A)
  const sentMessage = await device2.replyToMessage(userA, longText);
  // Check reply came through on device1
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: sentMessage,
  });
  // Close app
  await closeApp(device1, device2);
}
//  TO FIX  (NO LINK PREVIEW)
async function sendLink(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);
  const testLink = `https://type-level-typescript.com/objects-and-records`;
  // Create two users
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  // Send a link
  await device1.inputText("accessibility id", "Message input box", testLink);
  // Accept dialog for link preview
  await device1.clickOnElementAll({
    strategy: "accessibility id",
    selector: "Enable",
  });
  // await device1.clickOnByAccessibilityID("Enable");
  // No preview on first send
  await device1.clickOnByAccessibilityID("Send message button");
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message sent status: Sent",
    maxWait: 25000,
  });
  await device2.waitForTextElementToBePresent({
    strategy: "id",
    selector: "network.loki.messenger:id/linkPreviewView",
  });
  await closeApp(device1, device2);
}

async function sendCommunityInviteMessage(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);
  const communityLink = `https://chat.lokinet.dev/testing-all-the-things?public_key=1d7e7f92b1ed3643855c98ecac02fc7274033a3467653f047d6e433540c03f17`;
  const communityName = "Testing All The Things!";
  // Create two users
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  // Join community
  await sleepFor(100);
  await device1.navigateBack(platform);
  await joinCommunity(platform, device1, communityLink, communityName);
  // Wait for community to load
  // Add user B to community
  await device1.clickOnByAccessibilityID("More options", 5000);
  await device1.clickOnElementAll({
    strategy: "id",
    selector: "network.loki.messenger:id/title",
    text: "Add members",
  });
  await device1.clickOnElementByText({
    strategy: "accessibility id",
    selector: "Contact",
    text: userB.userName,
  });
  await device1.clickOnByAccessibilityID("Done");
  // Check device 2 for invitation from user A
  await closeApp(device1, device2);
}

async function unsendMessage(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);
  // Create two users
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);

  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  // send message from User A to User B
  const sentMessage = await device1.sendMessage(
    "Checking unsend functionality"
  );
  // await sleepFor(1000);
  await device2.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: sentMessage,
  });
  // console.log("Doing a long click on" + `${sentMessage}`);
  // Select and long press on message to delete it
  await device1.longPressMessage(sentMessage);
  // Select Delete icon
  await device1.clickOnByAccessibilityID("Delete message");
  // Select 'Delete for me and User B'
  await device1.clickOnByAccessibilityID("Delete for everyone");
  // Look in User B's chat for alert 'This message has been deleted?'
  await device2.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Deleted message",
  });
  // Excellent
  await closeApp(device1, device2);
}

async function deleteMessage(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);
  // Create two users
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  // send message from User A to User B
  const sentMessage = await device1.sendMessage(
    "Checking deletion functionality"
  );
  await device2.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: sentMessage,
  });
  // Select and long press on message to delete it
  await device1.longPressMessage(sentMessage);
  // Select Delete icon
  await device1.clickOnByAccessibilityID("Delete message");
  // Select 'Delete for just me'
  await device1.clickOnByAccessibilityID("Delete just for me");
  await device1.hasElementBeenDeleted({
    strategy: "accessibility id",
    selector: "Message body",
    text: sentMessage,
    maxWait: 8000,
  });

  // Excellent
  await closeApp(device1, device2);
}

async function checkPerformance(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);
  // Create two users
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  const timesArray1: Array<number> = [];
  const timesArray2: Array<number> = [];

  let i;
  for (i = 1; i <= 10; i++) {
    const timeMs = await device1.measureSendingTime(i);
    timesArray1.push(timeMs);
  }
  console.log(`Device 1:`, timesArray1);
  for (i = 1; i <= 10; i++) {
    const timeMs = await device2.measureSendingTime(i);
    timesArray2.push(timeMs);
  }
  console.log(`Device 2:`, timesArray2);
}

describe("Message checks 1:1 android", () => {
  androidIt("Send image", sendImage);
  androidIt("Send video", sendVideo);
  androidIt("Send voice message", sendVoiceMessage);
  androidIt("Send document", sendDocument);
  androidIt("Send link", sendLink);
  androidIt("Send gif", sendGif);
  androidIt("Send long text", sendLongMessage);
  androidIt("Send community invitation message", sendCommunityInviteMessage);
  androidIt("Unsend message", unsendMessage);
  androidIt("Delete message", deleteMessage);
  androidIt("Check performance", checkPerformance);
});

// Media saved notification
