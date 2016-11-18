# Privacy Policy for the “My Email” Alexa Skill:

This skill is not designed to track, read, or otherwise snoop on you or your email, and it does not intentionally store anything for future use except for the optional PIN you can set to access the skill on your Alexa device.  This is stored on your google Drive and requires your google password to access.  

The main purpose of this skill is to connect two systems you already use 1) the Amazon Alexa voice service (probably an Echo or Fire TV device) and 2) several services offered by Google.  The skill temporarily stores information from your email account while the skill is open in order to provide it to you through the Alexa interface.  To do this it accesses Amazon and Google services with their own privacy policies.  This page only describes the My Email skill itself, not the privacy policies of Google and Amazon, which are available on the Amazon and Google web sites.  

The specific services used by this Skill, enabled when you choose to link the skill to your Google account, include:
- Amazon Alexa Voice Service (your echo or other device uses this each time you speak to it)
- Amazon AWS Lambda (the place where the program for this skill runs)
- Google Gmail: to get and manage your messages, the skill requires read and modify access to your email account.  The skill does not request permission to permanently delete messages, but can move them to your trash folder.
- Google Drive: to store the optional PIN you can set, and to temporarily store any images you choose to send to an Alexa app card via the “show me” feature (see below for an important note about this feature).
Google Cloud Print: If you choose to use the printing features in the skill to print a message or attachment, the skill requires access to your list of Google cloud printers to do this.
Google Apps Scripts: This is a Google site where some of the skill’s program runs, to help link the different Google services together.  In using the skill, you authorize it to process and access the same Google services (Gmail, Drive and Cloud Print).

##IMPORTANT:
All of the information being used by this skill stays in your Google account, and can only be accessed using your Google password, withone exception.  If you use the “show me” feature to view an image attached to your email on an Alexa app card, the image is **temporarily stored as a publicly accessible file on your Google Drive**.  The skill attempts to delete the image before the skill exits, but if something goes wrong (for example if the skill crashes or can’t reach Google), it is possible for the image to remain stored and publicly accessible.  There is some additional protection in that such an image should not appear in searches, and people need to have a specific link in order to find it.  Nonetheless, it is highly recommended that you only view images for which someone else viewing it would not be a concern, or go to Google drive and manually remove any images that remain when this skill closes.  **If this is a matter of concern to you, please do not use the “show me” feature to display attached images.**  The skill will provide a verbal alert and request your concurrence before storing or displaying the image.  Other uses of the “show me” feature, such as to display recently spoken Alexa text, do not store information this way.

Please send any questions about this policy to beckyricha@gmail.com.
