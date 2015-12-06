//#######################################################################################//
//                         End to end testing                                           //
//#####################################################################################//

/** Purpose:  				
 *  This document outlines the behaviors of this application that we wanted to test and 
 *  how we went about testing them
 *
 *
 ** Behaviors to be tested:
 *  1. Facebook APIs: 
 *		 a. Does facebook authentication work (is the user able to login/logout)?
 * 		 b. Do we get the user's list of friends who have logged in to the app before?
 *		 c. Are we able to send messages and share links through facebook?
 *  2. Creating Occasions
 *		 a. Are we able to create an occasion with a title, description and a cover photo?
 *		 b. Are we able to preview the cover photo before creating the occasion?
 *		 c. Does the occasion show up in the My Occasions page, under User's Occasions?
 *		 d. Can the creator delete the occasion?
 *		 e. Can the creator edit the occasion (update title, description, cover photo)?
 *  3. Contributing to Occasions 
 *		 a. Are we able to share occasions with specific people so they can add thoughts?
 *		 b. Do these people receive an email with a link to the occasion once the occasion
 *			  is created?
 *		 c. Is the occasion added to the list of occasions they can view in 'My Occasions'?
 *		 d. Do these people have access to the occasion pre-publishing afterwards?
 *		 e. Do these people have access to the occasion post-publishing if they are not 
 *			  recipients too? (They shouldn't).
 *		 f. Can they view the thoughts of others if they are not recipients? (They shouldn't)
 *		 g. Can these participants add thoughts to the occasion.
 *		 h. Can they edit/delete the thoughts they have added but not the thoughts of others?
 *		 i. Can the event creater delete the thoughts of others but not edit them?
 *		 j. Can the creater add their own thoughts?
 *  4. Publishing Occasions
 *		 a. Is the creator required to set a publishing date/time for the occasion?
 *		 b. Is the user able to choose specific recipients of the event at that publish time?
 *		 c. Do these recipients recieve an email at the publishing time giving them access to
 *				the occasion?
 *		 d. Does the occasion show up on their 'My Occasions' list?
 *		 e. Does the add thoughts box disappear from the occasion at the publishing time?
 *		 f. Are participants unable to view it, unless they are also recipients?
 *	5. Creating public links
 *		 a. Does the creator have the option of creating public links for the occasion?
 *		 b. Do these links follow the correct behiovr in terms of authentication?
 *				- [Participant Permissions = Anyone with a link]: pre-publishing anyone with the
 *					link is authenticated and can access the occasion.
 *				- [Participant Permissions = Specific People]: pre-publishing only specified people
 *					are authenticated and can access the occasion (others will get a 404).
 *				- [Recipient Permissions = Anyone with a link]: post-publishing anyone with the
 *					link is authenticated and can access the occasion.
 *				- [Recipient Permissions = Specific People]: post-publishing only specified people
 *					are authenticated and can access the occasion. A side effect of this permission 
 *					setting is that pre-publishing, participants will not be able to view the thoughts
 *					of other participants unless they are also specified as recipients.
 *
 *
 ** End to end test:
 *
 *	User1:
 *	1. LogIn with User1's facebook account.
 *	2. Create an occasion: 
 *		 a. General: (title: test1, description: test, cover_photo: 
 *		 		http://www.thefreerangetechnologist.com/wp-content/uploads/2012/01/test.jpg) 
 *		 b. Publishing: (Date: same as today, Time: 10 minutes from now, Specific People=[User2])
 *		 c. Contributors: (Specific People= [User3, User4])
 *	3. Go to My Occasions and check if test1 is there. 
 *	4. Add a thought to test1.
 *  5. LogOut
 *
 *	User2:
 *	1. LogIn before publishing time.
 *	2. View My Occasions. You shouldn't be able to see test1.
 *	3. Follow the link to test1. You should get a 404.
 *	4. LogOut.
 *
 *  User3:
 *	1. Check for email from User1, follow the link received.
 *	2. Check that you can't view User1's thoughts, but can access the occasion.
 *	3. Add two thoughts.
 *	4. Edit one of them and delete the other.
 * 	5. LogOut.
 *
 *	User4: 
 *	1. LogIn and go to My Occasions. test1 should be there.
 *	2. Access test1 and add a thought. Shouldn't be able to see the thoughts of others.
 *	3. LogOut.
 *
 *  User1: 
 *	1. LogIn and view test1 in My Occasions.
 *	2. Should see three thoughts. Delete User3's thought.
 *  3. LogOut.
 *
 *	User2:
 *	1. Check email after publishing time. 
 *	2. Follow the link, should be able to see three thoughts and know text box.
 *	3. LogOut.
 *
 *	User4:
 *	1. Follow the link in your email after publishing time. Should get a 404. 
 *
 *
 *	Testing Public Links:
 *
 *	User1:
 *	1. Follow the same steps as before in creating occasion test2, but choose anyone with 
 *		 a link for participants.
 *	2. Any of the three users should have access to test2 before the publishing time and 
 *		 should be able to add a thought but only User2 and User1 will have access after.
 *
 *	User1:
 *	1. Follow the same steps as before in creating occasion test3, but choose anyone with 
 *		 a link for recipients.
 *	2. Any of the three users should have access to test23 after the publishing time and 
 *		 but only User3, User4 and User1 will have access before and can contribute to it.
 *
 *	User1:
 *	1. Follow the same steps as before in creating occasion test4, but choose anyone with 
 *		 a link for recipients and participants.
 *	2. All users should have access before and after publishing.
 *
 */




